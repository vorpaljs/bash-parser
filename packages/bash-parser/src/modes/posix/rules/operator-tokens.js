'use strict';
const hasOwnProperty = require('has-own-property');
const map = require('map-iterable');
const operators = require('../enums/operators');
const tokens = require('../../../utils/tokens');

const ReduceToOperatorTokenVisitor = {
	OPERATOR(tk) {
		if (hasOwnProperty(operators, tk.value)) {
			return tokens.changeTokenType(
				tk,
				operators[tk.value],
				tk.value
			);
		}
		return tk;
	}
};

module.exports = () => map(
	tokens.applyTokenizerVisitor(ReduceToOperatorTokenVisitor)
);

