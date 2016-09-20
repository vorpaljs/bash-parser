'use strict';
const parse = require('shell-quote-word');
const unescape = require('unescape-js');

function unquote(text) {
	const unquoted = parse(text);
	return unescape(unquoted[0]);
}

function unresolvedExpansions(token) {
	if (!token.expansion) {
		return false;
	}
	const unresolved = token.expansion.filter(xp => !xp.resolved);
	return unresolved.length > 0;
}

module.exports = function (options, utils) {
	const setValue = utils.tokens.setValue;

	return function * quoteRemoval(tokens) {
		for (let token of tokens) {
			if (token.WORD && !unresolvedExpansions(token)) {
				token = setValue(token, unquote(token.WORD));
			}
			if (token.ASSIGNMENT_WORD && !unresolvedExpansions(token)) {
				token = setValue(token, unquote(token.ASSIGNMENT_WORD));
			}
			yield token;
		}
	};
};
