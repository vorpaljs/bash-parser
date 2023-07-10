'use strict';
const hasOwnProperty = require('has-own-property');
const map = require('../../../vendored/map-iterable');
const tokens = require('../../../utils/tokens');

const reduceToOperatorTokenVisitor = operators => ({
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
});

module.exports = (options, mode) => map(
	tokens.applyTokenizerVisitor(reduceToOperatorTokenVisitor(mode.enums.operators))
);
