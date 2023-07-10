'use strict';
// const hasOwnProperty = require('has-own-property');
const values = require('object-values');
const compose = require('compose-function');
const map = require('../../../vendored/map-iterable');
const lookahead = require('iterable-lookahead');

module.exports = function identifyMaybeSimpleCommands(options, mode) {
	return compose(map((tk, idx, iterable) => {
		const last = iterable.behind(1) || {EMPTY: true, is: type => type === 'EMPTY'};

		// evaluate based on last token
		tk._.maybeStartOfSimpleCommand = Boolean(
			last.is('EMPTY') || last.is('SEPARATOR_OP') || last.is('OPEN_PAREN') ||
			last.is('CLOSE_PAREN') || last.is('NEWLINE') || last.is('NEWLINE_LIST') ||
			last.is('TOKEN') === ';' || last.is('PIPE') ||
			last.is('DSEMI') || last.is('OR_IF') || last.is('PIPE') || last.is('AND_IF') ||
			(!last.is('For') && !last.is('In') && !last.is('Case') && values(mode.enums.reservedWords).some(word => last.is(word)))
		);

		return tk;
	}), lookahead);
};
