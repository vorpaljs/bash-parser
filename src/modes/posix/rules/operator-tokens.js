'use strict';
const hasOwnProperty = require('has-own-property');
const map = require('map-iterable');
const copyTempObject = require('../copy-temp-object');
const operators = require('../enums/operators');

module.exports = function operatorTokens() {
	return map(tk => {
		if (hasOwnProperty(operators, tk.OPERATOR)) {
			return copyTempObject(tk, {
				[operators[tk.OPERATOR]]: tk.OPERATOR,
				loc: tk.loc
			});
		}

		return tk;
	});
};
