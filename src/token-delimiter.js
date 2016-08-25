'use strict';
const hasOwnProperty = require('has-own-property');
// const values = require('object-values');
const operators = require('./operators');

const QUOTING = {
	NO: {},
	ESCAPE: {},
	SINGLE: {},
	DOUBLE: {},
	PARAMETER: {},
	BACKTICK_COMMAND: {},
	COMMAND: {}
};

const QUOTING_DELIM = {
	'\\': QUOTING.ESCAPE,
	'\'': QUOTING.SINGLE,
	'"': QUOTING.DOUBLE,
	'`': QUOTING.BACKTICK_COMMAND,
	'${': QUOTING.PARAMETER,
	'$(': QUOTING.COMMAND
};

const isOperatorStart = (ch, lastCh) => lastCh !== '$' && '()|&!;<>'.indexOf(ch) !== -1;

const isOperator = op => hasOwnProperty(operators, op);

const mkLoc = (lineNumber, columnNumber) => ({
	startLine: lineNumber,
	startColumn: columnNumber
});

const finalizeLoc = (tk, lineNumber, columnNumber) => {
	Object.assign(tk.loc, {
		endLine: lineNumber,
		endColumn: columnNumber
	});
	return tk;
};

const empty = (lineNumber, columnNumber) => ({
	EMPTY: true,
	loc: mkLoc(lineNumber, columnNumber)
});

const newLine = (lineNumber, columnNumber) => ({
	NEWLINE: '\n',
	loc: mkLoc(lineNumber, columnNumber)
});

const eof = (lineNumber, columnNumber) => ({
	EOF: true,
	loc: mkLoc(lineNumber, columnNumber)
});

const operator = (ch, lineNumber, columnNumber) => ({
	OPERATOR: ch,
	loc: mkLoc(lineNumber, columnNumber)
});

const mkToken = (tk, lineNumber, columnNumber) => ({
	TOKEN: tk,
	loc: mkLoc(lineNumber, columnNumber)
});

const isQuotingCharacter = (ch, lastCh) => hasOwnProperty(QUOTING_DELIM, ch) || hasOwnProperty(QUOTING_DELIM, lastCh + ch);
/*
	delimit tokens on source according to rules defined
	in http://pubs.opengroup.org/onlinepubs/9699919799/utilities/V3_chap02.html#tag_18_03
*/
/* TODO: simplify */
/* eslint-disable complexity */
/* eslint-disable max-depth */
module.exports = function * tokenDelimiter(source) {
	let token = empty();
	let quoting = QUOTING.NO;
	let prevQuoting = null;
	let lastCharacter = null;

	let lineNumber = 0;
	let columnNumber = 0;
	let prevLineNumber = 0;
	let prevColumnNumber = 0;

	function advanceLoc(currentCharacter) {
		prevLineNumber = lineNumber;
		prevColumnNumber = columnNumber;

		if (currentCharacter === '\n') {
			lineNumber++;
			columnNumber = 0;
		} else {
			columnNumber++;
		}
		/* console.log({
			currentCharacter,
			prevLineNumber,
			prevColumnNumber,
			lineNumber,
			columnNumber
		})*/
	}

	for (const currentCharacter of source) {
		if (token.OPERATOR) {
			// RULE 2 -If the previous character was used as part of an operator and the
			// current character is not quoted and can be used with the current characters
			// to form an operator, it shall be used as part of that (operator) token.
			if (quoting === QUOTING.NO &&
				isOperator(token.OPERATOR + currentCharacter)) {
				token.OPERATOR += currentCharacter;

				// skip to next character
				lastCharacter = currentCharacter;
				advanceLoc(currentCharacter);
				continue;
			}
			// RULE 3 - If the previous character was used as part of an operator and the
			// current character cannot be used with the current characters to form an operator,
			// the operator containing the previous character shall be delimited.
			if (isOperator(token.OPERATOR)) {
				yield finalizeLoc(token, prevLineNumber, prevColumnNumber);
			} else {
				// TODO: test this, this should be emitted as an operator, not a token?
				const alteredTk = mkToken(
					token.OPERATOR,
					token.loc.startLine,
					token.loc.startColumn
				);
				yield finalizeLoc(alteredTk, prevLineNumber, prevColumnNumber);
			}

			token = empty(lineNumber, columnNumber);
		}

		// RULE 4 - If the current character is <backslash>, single-quote, or
		// double-quote and it is not quoted, it shall affect quoting for subsequent
		// characters up to the end of the quoted text.
		if (isQuotingCharacter(currentCharacter, lastCharacter) &&
			quoting === QUOTING.NO) {
			quoting = QUOTING_DELIM[currentCharacter];

			// TODO: test this, why a quoting character should e appended
			// to TOKEN?
			if (currentCharacter !== '\\') {
				if (token.TOKEN === undefined) {
					token = mkToken(currentCharacter, lineNumber, columnNumber);
				} else {
					token.TOKEN += currentCharacter;
				}
			}

			// skip to next character
			lastCharacter = currentCharacter;
			advanceLoc(currentCharacter);
			continue;
		}

		// <backslash> quoting should work within double quotes
		if (currentCharacter === '\\' &&
			quoting === QUOTING.DOUBLE) {
			quoting = QUOTING.ESCAPE;

			prevQuoting = QUOTING.DOUBLE;
			// skip to next character
			lastCharacter = currentCharacter;
			advanceLoc(currentCharacter);
			continue;
		}

		// Reset single or double quoting on close
		if (quoting === QUOTING_DELIM[currentCharacter] &&
			(quoting === QUOTING.SINGLE || quoting === QUOTING.DOUBLE)) {
			quoting = QUOTING.NO;

			// skip to next character
			// continue;
		}

		// RULE 6 - If the current character is not quoted and can be used as the
		// first character of a new operator, the current token (if any) shall be
		// delimited. The current character shall be used as the beginning of the
		// next (operator) token.
		if (isOperatorStart(currentCharacter, lastCharacter) &&
			quoting === QUOTING.NO) {
			// emit current token if not empty

			if (!token.EMPTY) {
				yield finalizeLoc(token, prevLineNumber, prevColumnNumber);
			}
			token = operator(currentCharacter, lineNumber, columnNumber);

			// skip to next character
			lastCharacter = currentCharacter;
			advanceLoc(currentCharacter);
			continue;
		}

		// RULE 7 - If the current character is an unquoted <newline>, the current
		// token shall be delimited.
		if (quoting === QUOTING.NO &&
				currentCharacter === '\n') {
			// emit current token if not empty
			if (!token.EMPTY) {
				yield finalizeLoc(token, prevLineNumber, prevColumnNumber);
			}

			token = empty(lineNumber, columnNumber);

			yield finalizeLoc(newLine(lineNumber, columnNumber), lineNumber, columnNumber);

			// skip to next character
			lastCharacter = currentCharacter;
			advanceLoc(currentCharacter);
			continue;
		}

		// RULE 8 - If the current character is an unquoted <blank>, any token
		// containing the previous character is delimited and the current
		// character shall be discarded.
		if (
			quoting === QUOTING.NO &&
			currentCharacter.match(/\s/)) {
			// emit current token if not empty
			if (!token.EMPTY) {
				yield finalizeLoc(token, prevLineNumber, prevColumnNumber);
			}

			token = empty(lineNumber, columnNumber);

			// skip to next character
			lastCharacter = currentCharacter;
			advanceLoc(currentCharacter);
			continue;
		}

		// reset character escaping if setted.
		if (quoting === QUOTING.ESCAPE) {
			quoting = prevQuoting || QUOTING.NO;
			prevQuoting = null;
		}

		// RULE 9 - If the previous character was part of a word, the current
		// character shall be appended to that word.
		if (token.TOKEN !== undefined) {
			token.TOKEN += currentCharacter;

			// skip to next character
			lastCharacter = currentCharacter;
			advanceLoc(currentCharacter);
			continue;
		}

		// RULE 10 - If the current character is a '#', it and all subsequent
		// characters up to, but excluding, the next <newline> shall be discarded
		// as a comment. The <newline> that ends the line is not considered part
		// of the comment.
		// TODO
		// RULE 11 - The current character is used as the start of a new word.
		token = mkToken(currentCharacter, lineNumber, columnNumber);
		lastCharacter = currentCharacter;

		advanceLoc(currentCharacter);
	}

	// RULE 1 - If the end of input is recognized, the current token shall
	// be delimited. If there is no current token, the end-of-input indicator
	// shall be returned as the token.
	if (!token.EMPTY) {
		yield finalizeLoc(token, prevLineNumber, prevColumnNumber);
	}

	advanceLoc('');
	yield finalizeLoc(eof(prevLineNumber, prevColumnNumber), prevLineNumber, prevColumnNumber);
};
