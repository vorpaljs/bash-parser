'use strict';
const hasOwnProperty = require('has-own-property');
const map = require('map-iterable');
const operators = require('../enums/operators');

module.exports = function operatorTokens(options, utils) {
	const changeTokenType = utils.tokens.changeTokenType;

	return map(tk => {
		if (tk.is('OPERATOR') && hasOwnProperty(operators, tk.value)) {
			return changeTokenType(tk, operators[tk.value], tk.value);
		}

		return tk;
	});
};
