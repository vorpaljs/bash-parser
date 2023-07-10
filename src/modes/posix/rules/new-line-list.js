'use strict';
const compose = require('compose-function');
const map = require('../../../vendored/map-iterable');
const lookahead = require('iterable-lookahead');
const tokens = require('../../../utils/tokens');
const filterNonNull = require('../../../utils/non-null');

const SkipRepeatedNewLines = {
	NEWLINE(tk, iterable) {
		const lastToken = iterable.behind(1) || tokens.mkToken('EMPTY');

		if (lastToken.is('NEWLINE')) {
			return null;
		}

		return tokens.changeTokenType(tk, 'NEWLINE_LIST', '\n');
	}
};

/* resolve a conflict in grammar by tokenize multiple NEWLINEs as a
newline_list token (it was a rule in POSIX grammar) */
module.exports = () => compose(
	filterNonNull,
	map(
		tokens.applyTokenizerVisitor(SkipRepeatedNewLines)
	),
	lookahead
);
