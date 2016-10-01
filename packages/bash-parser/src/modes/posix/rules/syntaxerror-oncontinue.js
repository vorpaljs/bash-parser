'use strict';
const map = require('map-iterable');

module.exports = function syntaxerrorOnContinue() {
	return map(tk => {
		if (tk && tk.is('CONTINUE')) {
			throw new SyntaxError('Unclosed ' + tk.value);
		}

		return tk;
	});
};
