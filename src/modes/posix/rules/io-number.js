'use strict';
const compose = require('compose-function');
const map = require('map-iterable');
const lookahead = require('iterable-lookahead');
const isOperator = require('../enums/io-file-operators').isOperator;

module.exports = function ioNumber(options, utils) {
	return compose(map((tk, idx, iterable) => {
		const next = iterable.ahead(1);

		if (tk && tk.is('WORD') && tk.value.match(/^[0-9]+$/) && isOperator(next)) {
			return utils.tokens.changeTokenType(tk, 'IO_NUMBER', tk.value);
		}

		return tk;
	}), lookahead);
};
