'use strict';
const compose = require('compose-function');
const map = require('../../../vendored/map-iterable');
const lookahead = require('iterable-lookahead');
const isValidName = require('../../../utils/is-valid-name');

module.exports = function forNameVariable() {
	return compose(map((tk, idx, iterable) => {
		let lastToken = iterable.behind(1) || {is: () => false};

		// if last token is For and current token form a valid name
		// type of token is changed from WORD to NAME

		if (lastToken.is('For') && tk.is('WORD') && isValidName(tk.value)) {
			return tk.changeTokenType('NAME', tk.value);
		}

		return tk;
	}), lookahead);
};
