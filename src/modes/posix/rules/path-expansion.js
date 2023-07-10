'use strict';

const map = require('../../../vendored/map-iterable');
const tokens = require('../../../utils/tokens');

module.exports = options => map(token => {
	if (token.is('WORD') && typeof options.resolvePath === 'function') {
		return tokens.setValue(token, options.resolvePath(token.value));
	}

	if (token.is('ASSIGNMENT_WORD') && typeof options.resolvePath === 'function') {
		const parts = token.value.split('=');
		return tokens.setValue(token, parts[0] + '=' + options.resolvePath(parts[1]));
	}

	return token;
});
