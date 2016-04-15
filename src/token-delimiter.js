'use strict';

const operators = require('./operators');

const QUOTING = {
	NO: {},
	ESCAPE: {},
	SINGLE: {},
	DOUBLE: {}
};

const QUOTING_DELIM = {
	'\\': QUOTING.ESCAPE,
	'\'': QUOTING.SINGLE,
	'"': QUOTING.DOUBLE
};

const EXPANDING = {
	NO: {},
	PARAMETER: {},
	COMMAND: {},
	ARITHMETIC: {}
};

const isOperatorStart = ch => '()|&!;<>'.indexOf(ch) !== -1;
const isOperator = op => operators.hasOwnProperty(op);
const empty = () => ({EMPTY: true});
const newLine = () => ({NEWLINE: '\n'});
const eof = () => ({EOF: true});
const operator = (ch) => ({OPERATOR: ch});
const mkToken = (tk) => ({TOKEN: tk});
const isQuotingCharacter = ch => QUOTING_DELIM.hasOwnProperty(ch);
/*
	delimit tokens on source according to rules defined
	in http://pubs.opengroup.org/onlinepubs/9699919799/utilities/V3_chap02.html#tag_18_03
*/
module.exports = function * tokenDelimiter(source) {
	let token = empty();
	let quoting = QUOTING.NO;
	let prevQuoting = null;
	let expanding = EXPANDING.NO;
	let expansion = null;
	let startOfExpansion = 0;
	let candidateParameterName = '';

	for (const currentCharacter of source) {
		if (token.OPERATOR) {
			// RULE 2 -If the previous character was used as part of an operator and the
			// current character is not quoted and can be used with the current characters
			// to form an operator, it shall be used as part of that (operator) token.
			if (quoting === QUOTING.NO &&
				isOperator(token.OPERATOR + currentCharacter)) {
				token.OPERATOR += currentCharacter;
				// skip to next character
				continue;
			}
			// RULE 3 - If the previous character was used as part of an operator and the
			// current character cannot be used with the current characters to form an operator,
			// the operator containing the previous character shall be delimited.
			if (isOperator(token.OPERATOR)) {
				yield token;
			} else {
				yield mkToken(token.OPERATOR);
			}
			token = empty();
		}

		// RULE 4 - If the current character is <backslash>, single-quote, or
		// double-quote and it is not quoted, it shall affect quoting for subsequent
		// characters up to the end of the quoted text.
		if (isQuotingCharacter(currentCharacter) &&
			quoting === QUOTING.NO) {
			quoting = QUOTING_DELIM[currentCharacter];

			if (currentCharacter !== '\\') {
				if (token.TOKEN === undefined) {
					token = mkToken(currentCharacter);
				} else {
					token.TOKEN += currentCharacter;
				}
			}

			// skip to next character
			continue;
		}

		// <backslash> quoting should work within double quotes
		if (currentCharacter === '\\' &&
			quoting === QUOTING.DOUBLE) {
			quoting = QUOTING.ESCAPE;

			prevQuoting = QUOTING.DOUBLE;
			// skip to next character
			continue;
		}

		// Reset single or double quoting on close
		if (quoting === QUOTING_DELIM[currentCharacter] &&
			(quoting === QUOTING.SINGLE || quoting === QUOTING.DOUBLE)) {
			quoting = QUOTING.NO;

			// skip to next character
			// continue;
		}

		// RULE 5 - If the current character is an unquoted '$' or '`', the shell shall
		// identify the start of any candidates for parameter expansion (Parameter Expansion),
		// command substitution (Command Substitution), or arithmetic expansion (Arithmetic
		// Expansion) from their introductory unquoted character sequences: '$' or "${", "$("
		// or '`', and "$((", respectively.

		if (quoting !== QUOTING.ESCAPE) {				// skip if escaping character
			if (expanding === EXPANDING.NO) {			// when no espanding is in progress
				if (currentCharacter === '$' && expansion === null) {
					// start of expansion candidate
					expansion = '$';
					startOfExpansion = token.EMPTY || !token.TOKEN ? 0 : token.TOKEN.length;
				} else if (expansion === '$') {		// expansion candidate in progress
					if (currentCharacter === '{') {
						// start of parameter expansion quoted by braces
						expanding = EXPANDING.PARAMETER;
						expansion = '';
					} else {		// expansion candidate failed
						if (candidateParameterName === '' && currentCharacter.match(/[a-zA-z_]/)) {	// eslint-disable-line no-lonely-if
							// first name character should be letter or underscore
							candidateParameterName += currentCharacter;
						} else if (candidateParameterName !== '' && currentCharacter.match(/[a-zA-z_0-9]/)) {
							// from second character on name char could be letter or digits or underscore
							candidateParameterName += currentCharacter;
						} else {
							// this character could not be part of a name
							if (candidateParameterName !== '') {
								// we have already accumulated a valid name, use it
								// end of parameter expansion
								token.expansion = {
									text: candidateParameterName,
									start: startOfExpansion,
									end: startOfExpansion + candidateParameterName.length + 1  // add 1 to take in account $
								};
								expansion = null;
								candidateParameterName = '';
							}

							startOfExpansion = 0;
						}
					}
				}
			} else if (expanding === EXPANDING.PARAMETER) {
				if (currentCharacter === '}') {
					// end of parameter expansion
					token.expansion = {
						text: expansion,
						start: startOfExpansion,
						end: startOfExpansion + expansion.length + 3  // add 3 to take in account ${}
					};
					startOfExpansion = 0;
					expanding = EXPANDING.NO;
					expansion = null;
				} else {
					// accumulation
					expansion += currentCharacter;
				}
			}
		}

		// RULE 6 - If the current character is not quoted and can be used as the
		// first character of a new operator, the current token (if any) shall be
		// delimited. The current character shall be used as the beginning of the
		// next (operator) token.
		if (isOperatorStart(currentCharacter) &&
			quoting === QUOTING.NO) {
			// emit current token if not empty
			if (!token.EMPTY) {
				yield token;
			}
			token = operator(currentCharacter);
			// skip to next character
			continue;
		}

		// RULE 7 - If the current character is an unquoted <newline>, the current
		// token shall be delimited.
		if (quoting === QUOTING.NO &&
				currentCharacter === '\n') {
			// emit current token if not empty
			if (!token.EMPTY) {
				yield token;
			}
			token = empty();
			yield newLine();
			// skip to next character
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
				yield token;
			}
			token = empty();
			// skip to next character
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
			continue;
		}

		// RULE 10 - If the current character is a '#', it and all subsequent
		// characters up to, but excluding, the next <newline> shall be discarded
		// as a comment. The <newline> that ends the line is not considered part
		// of the comment.
		// TODO
		// RULE 11 - The current character is used as the start of a new word.
		token = mkToken(currentCharacter);
	}

	// RULE 1 - If the end of input is recognized, the current token shall
	// be delimited. If there is no current token, the end-of-input indicator
	// shall be returned as the token.
	if (!token.EMPTY) {
		if (candidateParameterName !== '') {
			// we have already accumulated a valid name for parameter expansion, use it
			token.expansion = {
				text: candidateParameterName,
				start: startOfExpansion,
				end: startOfExpansion + candidateParameterName.length + 1  // add 1 to take in account $
			};
			expansion = null;
		}

		yield token;
	}
	yield eof();
};
