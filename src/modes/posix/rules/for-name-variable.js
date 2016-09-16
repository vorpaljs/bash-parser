'use strict';
const compose = require('compose-function');
const map = require('map-iterable');
const lookahead = require('iterable-lookahead');
const copyTempObject = require('../copy-temp-object');
const isValidName = require('../is-valid-name');

module.exports = function forNameVariable() {
	return compose(map((tk, idx, iterable) => {
		let lastToken = iterable.behind(1) || {};

		// if last token is For and current token form a valid name
		// type of token is changed from WORD to NAME

		if (lastToken.For && tk.WORD && isValidName(tk.WORD)) {
			return copyTempObject(tk, {
				NAME: tk.WORD,
				loc: tk.loc
			});
		}

		return tk;
	}), lookahead);
};
