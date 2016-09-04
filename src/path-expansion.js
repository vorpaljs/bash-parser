module.exports = options => function * pathExpansion(tokens) {
	for (const token of tokens) {
		if (token.WORD && typeof options.resolvePath === 'function') {
			token.WORD = options.resolvePath(token.WORD);
		}
		if (token.ASSIGNMENT_WORD && typeof options.resolvePath === 'function') {
			token.ASSIGNMENT_WORD = options.resolvePath(token.ASSIGNMENT_WORD);
		}
		yield token;
	}
};
