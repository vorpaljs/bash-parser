'use strict';
const parse = require('shell-quote-word');
const unescape = require('unescape-js');

function unquote(text) {
	return unescape(parse(text, (...args) => console.log(args))[0]);
/*
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
			} else if (lastChar !== '\\' && quoting === '') {
				quoting = ch;
			}
		}

		lastChar = ch;
	}
	// console.log(result)
	return result;
	*/
}

// console.log(unquote('a"b"\'c\''))

function unresolvedExpansions(token) {
	if (!token.expansion) {
		return false;
	}
	const unresolved = token.expansion.filter(xp => !xp.resolved);
	return unresolved.length > 0;
}

module.exports = function * quoteRemoval(tokens) {
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
