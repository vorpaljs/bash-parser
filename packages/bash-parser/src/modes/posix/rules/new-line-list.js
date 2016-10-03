'use strict';
const compose = require('compose-function');
const map = require('map-iterable');
const lookahead = require('iterable-lookahead');
const filterIterator = require('filter-iterator');
const reverse = require('reverse-arguments');
const curry = require('curry');
const tokens = require('../../../utils/tokens');

const filter = curry.to(2, reverse(filterIterator));

const nonNull = tk => {
	// console.log('filterNonNull:', tk);
	return tk !== null;
};

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
	filter(nonNull),
	map(
		tokens.applyTokenizerVisitor(SkipRepeatedNewLines)
	),
	lookahead
);

