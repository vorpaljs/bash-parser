'use strict';
const map = require('../../../vendored/map-iterable');
const tokens = require('../../../utils/tokens');

const replace = (text, resolveHomeUser) => {
	let replaced = false;
	let result = text.replace(/^~([^\/]*)\//, (match, p1) => {
		replaced = true;
		return resolveHomeUser(p1 || null) + '/';
	});
	// console.log({result, replaced})
	if (!replaced) {
		result = text.replace(/^~(.*)$/, (match, p1) => {
			return resolveHomeUser(p1 || null);
		});
	}

	return result;
};

module.exports = options => map(token => {
	if (token.is('WORD') && typeof options.resolveHomeUser === 'function') {
		return tokens.setValue(token, replace(token.value, options.resolveHomeUser));
	}

	if (token.is('ASSIGNMENT_WORD') && typeof options.resolveHomeUser === 'function') {
		const parts = token.value.split('=', 2);
		const target = parts[0];
		const sourceParts = parts[1];

		const source = sourceParts
			.split(':')
			.map(text => replace(text, options.resolveHomeUser))
			.join(':');

		return tokens.setValue(token, target + '=' + source);
	}

	return token;
});
