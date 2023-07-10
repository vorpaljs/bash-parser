'use strict';
const parse = require('shell-quote-word');
const unescape = require('unescape-js');
const map = require('../../../vendored/map-iterable');
const tokens = require('../../../utils/tokens');

function unquote(text) {
	const unquoted = parse(text);

	if (unquoted.length === 0) {
		return text;
	}

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

module.exports = () => map(token => {
	if (token.is('WORD') || token.is('ASSIGNMENT_WORD')) {
		if (!unresolvedExpansions(token)) {
			return tokens.setValue(token, unquote(token.value));
		}
	}
	return token;
});
