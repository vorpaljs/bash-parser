'use strict';
const hasOwnProperty = require('has-own-property');
const values = require('object-values');
const compose = require('compose-function');
const map = require('map-iterable');
const lookahead = require('iterable-lookahead');
const words = require('../enums/reserved-words');
/*
function defined(v) {
	return v !== undefined;
}
*/
function isValidReservedWordPosition(tk, iterable) {
	const last = iterable.behind(1) || {EMPTY: true, is: type => type === 'EMPTY'};
	const twoAgo = iterable.behind(2) || {EMPTY: true, is: type => type === 'EMPTY'};

	// evaluate based on last token
	const startOfCommand = (
		last.is('EMPTY') || last.is('SEPARATOR_OP') || last.is('OPEN_PAREN') ||
		last.is('CLOSE_PAREN') || last.is('NEWLINE') || last.is('NEWLINE_LIST') ||
		last.is('DSEMI') || last.value === ';' || last.is('PIPE') ||
		last.is('OR_IF') || last.is('PIPE') || last.is('AND_IF')
	);

	const lastIsReservedWord = (!last.value === 'for' && !last.value === 'in' && !last.value === 'case' && values(words).some(word => last.is(word)));

	const thirdInCase = twoAgo.value === 'case' && tk.is('TOKEN') && tk.value.toLowerCase() === 'in';
	const thirdInFor = twoAgo.value === 'for' && tk.is('TOKEN') &&
		(tk.value.toLowerCase() === 'in' || tk.value.toLowerCase() === 'do');

	// console.log({tk, startOfCommand, lastIsReservedWord, thirdInFor, thirdInCase, twoAgo})
	return tk.value === '}' || startOfCommand || lastIsReservedWord || thirdInFor || thirdInCase;
}

module.exports = function reservedWords(options, utils) {
	const changeTokenType = utils.tokens.changeTokenType;

	return compose(map((tk, idx, iterable) => {
		// console.log(tk, isValidReservedWordPosition(tk, iterable), hasOwnProperty(words, tk.value))
		// TOKEN tokens consisting of a reserved word
		// are converted to their own token types
		// console.log({tk, v:isValidReservedWordPosition(tk, iterable)})
		if (isValidReservedWordPosition(tk, iterable) && hasOwnProperty(words, tk.value)) {
			return changeTokenType(tk, words[tk.value], tk.value);
		}

		// otherwise, TOKEN tokens are converted to
		// WORD tokens
		if (tk.is('TOKEN')) {
			return changeTokenType(tk, 'WORD', tk.value);
		}

		// other tokens are amitted as-is
		return tk;
	}), lookahead.depth(2));
};
