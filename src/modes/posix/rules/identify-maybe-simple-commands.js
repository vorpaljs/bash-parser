'use strict';
const hasOwnProperty = require('has-own-property');
const values = require('object-values');
const compose = require('compose-function');
const map = require('map-iterable');
const lookahead = require('iterable-lookahead');
const reservedWords = require('../enums/reserved-words');

module.exports = function identifyMaybeSimpleCommands() {
	return compose(map((tk, idx, iterable) => {
		const last = iterable.behind(1) || {EMPTY: true};

		// evaluate based on last token
		tk._.maybeStartOfSimpleCommand = Boolean(
			last.EMPTY || last.SEPARATOR_OP || last.OPEN_PAREN ||
			last.CLOSE_PAREN || last.NEWLINE || last.NEWLINE_LIST ||
			last.TOKEN === ';' || last.PIPE ||
			last.DSEMI || last.OR_IF || last.PIPE || last.AND_IF ||
			(!last.For && !last.In && !last.Case && values(reservedWords).some(word => hasOwnProperty(last, word)))
		);

		return tk;
	}), lookahead);
};
