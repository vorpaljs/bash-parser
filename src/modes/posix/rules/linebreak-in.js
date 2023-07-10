'use strict';
const compose = require('compose-function');
const map = require('../../../vendored/map-iterable');
const lookahead = require('iterable-lookahead');
const tokens = require('../../../utils/tokens');
const filterNonNull = require('../../../utils/non-null');

const ReplaceWithLineBreakIn = {
	NEWLINE_LIST(tk, iterable) {
		const nextToken = iterable.ahead(1) || tokens.mkToken('EMPTY');

		if (nextToken.is('In')) {
			return tokens.changeTokenType(
				tk,
				'LINEBREAK_IN',
				'\nin'
			);
		}

		return tk;
	},

	In(tk, iterable) {
		const lastToken = iterable.behind(1) || tokens.mkToken('EMPTY');

		if (lastToken.is('NEWLINE_LIST')) {
			return null;
		}

		return tk;
	}
};

/* resolve a conflict in grammar by tokenize linebreak+in
tokens as a new  linebreak_in */
module.exports = () => compose(
	filterNonNull,
	map(
		tokens.applyTokenizerVisitor(ReplaceWithLineBreakIn)
	),
	lookahead
);
