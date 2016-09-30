'use strict';
module.exports = (options, utils) => function * pathExpansion(tokens) {
	for (const token of tokens) {
		if (token.is('WORD') && typeof options.resolvePath === 'function') {
			yield utils.tokens.setValue(token, options.resolvePath(token.value));
		} else if (token.is('ASSIGNMENT_WORD') && typeof options.resolvePath === 'function') {
			const parts = token.value.split('=');
			yield utils.tokens.setValue(token, parts[0] + '=' + options.resolvePath(parts[1]));
		} else {
			yield token;
		}
	}
};
