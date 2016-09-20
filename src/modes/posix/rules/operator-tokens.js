'use strict';
const hasOwnProperty = require('has-own-property');
const map = require('map-iterable');
const operators = require('../enums/operators');

module.exports = function operatorTokens(options, utils) {
	const changeTokenType = utils.tokens.changeTokenType;

	return map(tk => {
		if (hasOwnProperty(operators, tk.OPERATOR)) {
			return changeTokenType(tk, operators[tk.OPERATOR], tk.OPERATOR);
		}

		return tk;
	});
};
