'use strict';
module.exports = options => function * pathExpansion(tokens) {
	for (const token of tokens) {
		if (token.WORD && typeof options.resolvePath === 'function') {
			token.WORD = options.resolvePath(token.WORD);
		}
		if (token.ASSIGNMENT_WORD && typeof options.resolvePath === 'function') {
			const parts = token.ASSIGNMENT_WORD.split('=');
			token.ASSIGNMENT_WORD = parts[0] + '=' + options.resolvePath(parts[1]);
		}
		yield token;
	}
};
