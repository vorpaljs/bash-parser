'use strict';
const parse = require('shell-quote-word');
const unescape = require('unescape-js');

function unquote(text) {
	const unquoted = parse(text);
	if (unquoted[0].comment) {
		return '';
	}
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
			if (token.is('WORD') || token.is('ASSIGNMENT_WORD')) {
				if (!unresolvedExpansions(token)) {
					token = setValue(token, unquote(token.value));
				}
			}
			yield token;
		}
	};
};
