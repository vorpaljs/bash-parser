'use strict';
const compose = require('compose-function');
const map = require('map-iterable');
const lookahead = require('iterable-lookahead');

module.exports = function functionName(options, utils) {
	const changeTokenType = utils.tokens.changeTokenType;
	return compose(map((tk, idx, iterable) => {
		// apply only on valid positions
		// (start of simple commands)
		// if token can form the name of a function,
		// type of token is changed from WORD to NAME
		if (
			tk._.maybeStartOfSimpleCommand &&
			tk.WORD &&
			iterable.ahead(2) &&
			iterable.ahead(1).OPEN_PAREN &&
			iterable.ahead(2).CLOSE_PAREN
		) {
			tk = changeTokenType(tk, 'NAME', tk.WORD);
		}

		return tk;
	}), lookahead.depth(2));
};
