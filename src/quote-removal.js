'use strict';
const parse = require('shell-quote-word');
const unescape = require('unescape-js');

function unquote(text) {
	return unescape(parse(text)[0]);
}

function unresolvedExpansions(token) {
	if (!token.expansion) {
		return false;
	}
	const unresolved = token.expansion.filter(xp => !xp.resolved);
	return unresolved.length > 0;
}

module.exports = () => function * quoteRemoval(tokens) {
	for (const token of tokens) {
		if (token.WORD && !unresolvedExpansions(token)) {
			token.WORD = unquote(token.WORD);
		}
		if (token.ASSIGNMENT_WORD && !unresolvedExpansions(token)) {
			token.ASSIGNMENT_WORD = unquote(token.ASSIGNMENT_WORD);
		}
		yield token;
	}
};
