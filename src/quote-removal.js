'use strict';

function unquote(text) {
	if (text[0] === '"' || text[0] === '\'') {
		text = text.slice(1);
	}

	if (text.slice(-1)[0] === '"' || text.slice(-1)[0] === '\'') {
		text = text.slice(0, -1);
	}

	text = text.replace(/([^\\])\\/g, '$1');
	return text;
}

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
