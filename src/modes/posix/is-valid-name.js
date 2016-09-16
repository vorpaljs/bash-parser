'use strict';

module.exports = function isValidName(text) {
	return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(text);
};
