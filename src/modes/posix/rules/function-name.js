'use strict';
const compose = require('compose-function');
const map = require('../../../vendored/map-iterable');
const lookahead = require('iterable-lookahead');

module.exports = function functionName() {
	return compose(map((tk, idx, iterable) => {
		// apply only on valid positions
		// (start of simple commands)
		// if token can form the name of a function,
		// type of token is changed from WORD to NAME

		/* console.log(
			tk._.maybeStartOfSimpleCommand,
			tk.is('WORD'),
			iterable.ahead(1) &&
				iterable.ahead(1).is('OPEN_PAREN'),
			iterable.ahead(2) &&
				iterable.ahead(2).is('CLOSE_PAREN')
		);*/

		if (
			tk._.maybeStartOfSimpleCommand &&
			tk.is('WORD') &&
			iterable.ahead(2) &&
			iterable.ahead(1).is('OPEN_PAREN') &&
			iterable.ahead(2).is('CLOSE_PAREN')
		) {
			tk = tk.changeTokenType('NAME', tk.value);
		}

		return tk;
	}), lookahead.depth(2));
};
