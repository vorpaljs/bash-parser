'use strict';

const replace = (text, resolveHomeUser) => {
	let replaced = false;
	let result = text.replace(/^~[^\/]*\//, (match, p1) => {
		replaced = true;
		return resolveHomeUser(p1 || null) + '/';
	});
	// console.log({result, replaced})
	if (!replaced) {
		result = text.replace(/^~.*$/, (match, p1) => {
			return resolveHomeUser(p1 || null);
		});
	}

	return result;
};

module.exports = options => function * resolveTilde(tokens) {
	for (const token of tokens) {
		if (token.WORD && typeof options.resolveHomeUser === 'function') {
			token.WORD = replace(token.WORD, options.resolveHomeUser);
		}
		if (token.ASSIGNMENT_WORD && typeof options.resolveHomeUser === 'function') {
			const parts = token.ASSIGNMENT_WORD.split('=', 2);
			const target = parts[0];
			const sourceParts = parts[1];

			const source = sourceParts
				.split(':')
				.map(text => replace(text, options.resolveHomeUser))
				.join(':');

			token.ASSIGNMENT_WORD = target + '=' + source;
		}
		yield token;
	}
};
