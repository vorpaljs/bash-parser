'use strict';
module.exports = (options, utils) => function * pathExpansion(tokens) {
	for (const token of tokens) {
		if (token.WORD && typeof options.resolvePath === 'function') {
			yield utils.tokens.setValue(token, options.resolvePath(token.WORD));
		} else if (token.ASSIGNMENT_WORD && typeof options.resolvePath === 'function') {
			const parts = token.ASSIGNMENT_WORD.split('=');
			yield utils.tokens.setValue(token, parts[0] + '=' + options.resolvePath(parts[1]));
		} else {
			yield token;
		}
	}
};
