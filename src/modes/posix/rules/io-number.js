'use strict';
const compose = require('compose-function');
const map = require('../../../vendored/map-iterable');
const lookahead = require('iterable-lookahead');

module.exports = function ioNumber(options, mode) {
	return compose(map((tk, idx, iterable) => {
		const next = iterable.ahead(1);

		if (tk && tk.is('WORD') && tk.value.match(/^[0-9]+$/) && mode.enums.IOFileOperators.isOperator(next)) {
			return tk.changeTokenType('IO_NUMBER', tk.value);
		}

		return tk;
	}), lookahead);
};
