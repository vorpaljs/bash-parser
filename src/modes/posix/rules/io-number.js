'use strict';
const compose = require('compose-function');
const map = require('map-iterable');
const lookahead = require('iterable-lookahead');
const isOperator = require('../enums/io-file-operators').isOperator;
const copyTempObject = require('../copy-temp-object');

module.exports = function ioNumber() {
	return compose(map((tk, idx, iterable) => {
		const next = iterable.ahead(1);

		if (tk && tk.WORD && tk.WORD.match(/^[0-9]+$/) && isOperator(next)) {
			return copyTempObject(tk, {
				IO_NUMBER: tk.WORD,
				loc: tk.loc
			});
		}

		return tk;
	}), lookahead);
};
