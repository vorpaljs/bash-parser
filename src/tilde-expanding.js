const replace = (text, resolveHomeUser) => {
	let replaced = false;
	let result = text.replace(/^~[^\/]*\//, (...args) => {
		replaced = true;
		return resolveHomeUser(args[1] || null) + '/';
	});
	// console.log({result, replaced})
	if (!replaced) {
		result = text.replace(/^~.*$/, (...args) => {
			return resolveHomeUser(args[1] || null);
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
			const [target, ...sourceParts] = token.ASSIGNMENT_WORD.split('=');
			const source = sourceParts
				.join('=')
				.split(':')
				.map(text => replace(text, options.resolveHomeUser))
				.join(':');

			token.ASSIGNMENT_WORD = target + '=' + source;
		}
		yield token;
	}
};
