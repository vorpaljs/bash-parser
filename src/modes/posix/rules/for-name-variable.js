'use strict';
const compose = require('compose-function');
const map = require('map-iterable');
const lookahead = require('iterable-lookahead');

module.exports = function forNameVariable(options, utils) {
	return compose(map((tk, idx, iterable) => {
		let lastToken = iterable.behind(1) || {};

		// if last token is For and current token form a valid name
		// type of token is changed from WORD to NAME

		if (lastToken.For && tk.WORD && utils.isValidName(tk.WORD)) {
			return utils.tokens.changeTokenType(tk, 'NAME', tk.WORD);
		}

		return tk;
	}), lookahead);
};
