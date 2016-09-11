'use strict';

function unquote(text) {
	// console.log(text)
	let lastChar = null;
	let result = '';
	let quoting = '';
	for (const ch of text) {
		if (ch === '\\' && lastChar === '\\') {
			result += ch;
		} else if (ch === '"' || ch === '\'') {
			if (lastChar === '\\' || (quoting !== '' && quoting !== ch)) {
				result += ch;
			}
		} else if (ch !== '\\') {
			result += ch;
		}

		if (ch === '"' || ch === '\'') {
			if (lastChar !== '\\' && quoting === ch) {
				quoting = '';
			}

			if (lastChar !== '\\' && quoting === '') {
				quoting = ch;
			}
		}

		lastChar = ch;
	}
	// console.log(result)
	return result;
}
// console.log(unquote('"TEST1 \\"TEST2"'))
module.exports = function * quoteRemoval(tokens) {
	for (const token of tokens) {
		if (token.WORD) {
			token.WORD = unquote(token.WORD);
		}
		if (token.ASSIGNMENT_WORD) {
			token.ASSIGNMENT_WORD = unquote(token.ASSIGNMENT_WORD);
		}
		yield token;
	}
};
