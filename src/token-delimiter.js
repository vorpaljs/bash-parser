'use strict';
const hasOwnProperty = require('has-own-property');
const lookahead = require('iterable-lookahead');
const operators = require('./operators');

const QUOTING = {
	NO: {value: 'NO'},
	ESCAPE: {value: 'ESCAPE'},
	SINGLE: {close: '\'', value: 'SINGLE'},
	DOUBLE: {close: '"', value: 'DOUBLE'},
	PARAMETER: {close: '}', value: 'PARAMETER'},
	BACKTICK_COMMAND: {close: '`', value: 'BACKTICK_COMMAND'},
	COMMAND: {close: ')', value: 'COMMAND'},
	ARITHMETIC: {close: '))', value: 'ARITHMETIC'}
};

const QUOTING_DELIM = {
	'\\': QUOTING.ESCAPE,
	'\'': QUOTING.SINGLE,
	'"': QUOTING.DOUBLE,
	'`': QUOTING.BACKTICK_COMMAND,
	'${': QUOTING.PARAMETER,
	'$(': QUOTING.COMMAND,
	'$((': QUOTING.ARITHMETIC
};

const isOperator = op => hasOwnProperty(operators, op);

const mkLoc = (lineNumber, columnNumber) => ({
	startLine: lineNumber,
	startColumn: columnNumber
});

const closingQuotingCharacter = (quoting, ch, lastCh, penultCh) =>
	(quoting.close === ch && lastCh !== '\\') ||
	(quoting.close === lastCh + ch && penultCh !== '\\');

const mkStartState = charIterator => ({
	token: {
		EMPTY: true,
		loc: mkLoc(0, 0)
	},
	quoting: QUOTING.NO,
	prevQuoting: null,
	lineNumber: 0,
	columnNumber: 0,
	prevLineNumber: 0,
	prevColumnNumber: 0,
	isComment: false,
	charIterator,

	setEscaping() {
		this.quoting = QUOTING.ESCAPE;
		this.prevQuoting = QUOTING.DOUBLE;
	},

	resetEscaping() {
		this.quoting = this.prevQuoting || QUOTING.NO;
		this.prevQuoting = null;
	},

	isEscaping() {
		return this.quoting === QUOTING.ESCAPE;
	},

	setOperatorToken(text) {
		this.token = {
			OPERATOR: text,
			loc: mkLoc(this.lineNumber, this.columnNumber)
		};
	},

	setNewLineToken() {
		this.token = {
			NEWLINE: '\n',
			loc: mkLoc(this.lineNumber, this.columnNumber)
		};
	},

	setGenericToken(text) {
		this.token = {
			TOKEN: text,
			loc: mkLoc(this.lineNumber, this.columnNumber)
		};
	},

	setEmptyToken() {
		this.token = {
			EMPTY: true,
			loc: mkLoc(this.lineNumber, this.columnNumber)
		};
	},

	setEOFToken() {
		this.token = {
			EOF: true,
			loc: mkLoc(this.prevLineNumber, this.prevColumnNumber)
		};
	},

	advanceLoc(currentCharacter) {
		this.prevLineNumber = this.lineNumber;
		this.prevColumnNumber = this.columnNumber;

		if (currentCharacter === '\n') {
			this.lineNumber++;
			this.columnNumber = 0;
		} else {
			this.columnNumber++;
		}
	},

	canAppendToOperator(currentCharacter) {
		return this.quoting === QUOTING.NO &&
				isOperator(this.token.OPERATOR + currentCharacter);
	},

	finalizeCurrentToken() {
		Object.assign(this.token.loc, {
			endLine: this.prevLineNumber,
			endColumn: this.prevColumnNumber
		});
		return this.token;
	},

	currentTokenIsOperatorPart() {
		return this.token.OPERATOR;
	},

	currentTokenIsEmpty() {
		return Boolean(this.token.EMPTY);
	},

	currentTokenIsCompleteOperator() {
		return isOperator(this.token.OPERATOR);
	},

	appendToOperator(currentCharacter) {
		this.token.OPERATOR += currentCharacter;
	},

	quotingCharacter(ch) {
		const lastCh = this.charIterator.behind(1);
		const penultCh = this.charIterator.behind(2);

		return QUOTING_DELIM[penultCh + lastCh + ch] ||
		QUOTING_DELIM[lastCh + ch] ||
		QUOTING_DELIM[ch];
	},

	isOperatorStart(ch) {
		const lastCh = this.charIterator.behind(1);
		return lastCh !== '$' && '()|&!;<>'.indexOf(ch) !== -1;
	}
});

/*
	delimit tokens on source according to rules defined
	in http://pubs.opengroup.org/onlinepubs/9699919799/utilities/V3_chap02.html#tag_18_03
*/
/* TODO: simplify */
/* eslint-disable complexity */
/* eslint-disable max-depth */
module.exports = function * tokenDelimiter(source) {
	const charIterator = lookahead(source, 2);
	const state = mkStartState(charIterator);

	for (const currentCharacter of charIterator) {
		if (state.isComment) {
			if (currentCharacter === '\n') {
				state.isComment = false;
			} else {
				state.advanceLoc(currentCharacter);
				continue;
			}
		}

		if (state.currentTokenIsOperatorPart()) {
			// RULE 2 -If the previous character was used as part of an operator and the
			// current character is not quoted and can be used with the current characters
			// to form an operator, it shall be used as part of that (operator) token.
			if (state.canAppendToOperator(currentCharacter)) {
				state.appendToOperator(currentCharacter);
				state.advanceLoc(currentCharacter);

				continue;
			}

			// RULE 3 - If the previous character was used as part of an operator and the
			// current character cannot be used with the current characters to form an operator,
			// the operator containing the previous character shall be delimited.
			if (state.currentTokenIsCompleteOperator()) {
				yield state.finalizeCurrentToken();
			} else {
				// The current token cannot form an OPERATOR by itself,
				// even if it could start one,
				// so it is emitted as a normal token.
				state.setGenericToken(state.token.OPERATOR);
				yield state.finalizeCurrentToken();
			}

			state.setEmptyToken();
		}

		// RULE 4 - If the current character is <backslash>, single-quote, or
		// double-quote and it is not quoted, it shall affect quoting for subsequent
		// characters up to the end of the quoted text.
		if (state.quotingCharacter(currentCharacter) && state.quoting === QUOTING.NO) {
			state.quoting = state.quotingCharacter(currentCharacter);

			if (currentCharacter !== '\\') {
				if (state.token.TOKEN === undefined) {
					state.setGenericToken(currentCharacter);
				} else {
					state.token.TOKEN += currentCharacter;
				}
			}

			// skip to next character

			state.advanceLoc(currentCharacter);
			continue;
		}

		if (state.quoting === QUOTING.COMMAND && state.quotingCharacter(currentCharacter) === QUOTING.ARITHMETIC) {
			state.quoting = state.quotingCharacter(currentCharacter);
		}

		// <backslash> quoting should work within double quotes
		if (currentCharacter === '\\' && state.quoting === QUOTING.DOUBLE) {
			state.setEscaping();
			state.advanceLoc(currentCharacter);
			continue;
		}

		// RULE 6 - If the current character is not quoted and can be used as the
		// first character of a new operator, the current token (if any) shall be
		// delimited. The current character shall be used as the beginning of the
		// next (operator) token.
		if (state.isOperatorStart(currentCharacter) && state.quoting === QUOTING.NO) {
			if (!state.currentTokenIsEmpty()) {
				yield state.finalizeCurrentToken();
			}
			state.setOperatorToken(currentCharacter);

			state.advanceLoc(currentCharacter);
			continue;
		}

		// RULE 7 - If the current character is an unquoted <newline>, the current
		// token shall be delimited.
		if (!state.isEscaping() && currentCharacter === '\n') {
			// emit current token if not empty
			if (!state.currentTokenIsEmpty()) {
				yield state.finalizeCurrentToken();
			}

			state.quoting = QUOTING.NO;
			state.setNewLineToken();
			state.prevLineNumber = state.lineNumber;
			state.prevColumnNumber = state.columnNumber;
			yield state.finalizeCurrentToken();
			state.setEmptyToken();
			// skip to next character

			state.advanceLoc(currentCharacter);
			continue;
		}

		// RULE 8 - If the current character is an unquoted <blank>, any token
		// containing the previous character is delimited and the current
		// character shall be discarded.
		// console.log(currentCharacter.match(/\s/), quoting)
		if (state.quoting === QUOTING.NO && currentCharacter.match(/\s/)) {
			// emit current token if not empty
			if (!state.currentTokenIsEmpty()) {
				yield state.finalizeCurrentToken();
			}

			state.setEmptyToken();
			state.advanceLoc(currentCharacter);
			continue;
		}

		// reset character escaping if setted.
		if (state.isEscaping()) {
			state.resetEscaping();
		}

		// Reset single or double quoting on close
		if (closingQuotingCharacter(state.quoting, currentCharacter, charIterator.behind(1), charIterator.behind(2))) {
			state.quoting = QUOTING.NO;

			// skip to next character
			// continue;
		}

		// RULE 9 - If the previous character was part of a word, the current
		// character shall be appended to that word.
		if (state.token.TOKEN !== undefined) {
			state.token.TOKEN += currentCharacter;

			// skip to next character

			state.advanceLoc(currentCharacter);
			continue;
		}

		// RULE 10 - If the current character is a '#', it and all subsequent
		// characters up to, but excluding, the next <newline> shall be discarded
		// as a comment. The <newline> that ends the line is not considered part
		// of the comment.
		if (currentCharacter === '#') {
			state.isComment = true;
		} else if (currentCharacter === '\n') {
			state.setEmptyToken();
		} else {
			// RULE 11 - The current character is used as the start of a new word.
			state.setGenericToken(currentCharacter);
		}

		state.advanceLoc(currentCharacter);
	}

	// RULE 1 - If the end of input is recognized, the current token shall
	// be delimited. If there is no current token, the end-of-input indicator
	// shall be returned as the token.
	if (!state.currentTokenIsEmpty()) {
		yield state.finalizeCurrentToken();
	}

	state.advanceLoc('');
	state.setEOFToken();
	yield state.finalizeCurrentToken();
};
