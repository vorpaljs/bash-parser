'use strict';
const hasOwnProperty = require('has-own-property');
const values = require('object-values');
const compose = require('compose-function');
const map = require('map-iterable');
const lookahead = require('iterable-lookahead');
const words = require('../enums/reserved-words');
const copyTempObject = require('../copy-temp-object');

function defined(v) {
	return v !== undefined;
}

function isValidReservedWordPosition(tk, iterable) {
	const last = iterable.behind(1) || {EMPTY: true};
	const twoAgo = iterable.behind(2) || {EMPTY: true};

	// evaluate based on last token
	const startOfCommand = Boolean(
		last.EMPTY || last.SEPARATOR_OP || last.OPEN_PAREN ||
		last.CLOSE_PAREN || last.NEWLINE || last.NEWLINE_LIST ||
		last.DSEMI || last.TOKEN === ';' || last.PIPE ||
		last.OR_IF || last.PIPE || last.AND_IF
	);

	const lastIsReservedWord = (!last.For && !last.In && !last.Case && values(words).some(word => hasOwnProperty(last, word)));

	const thirdInCase = Boolean(twoAgo.Case) && tk.TOKEN && tk.TOKEN.toLowerCase() === 'in';
	const thirdInFor = Boolean(twoAgo.For) && tk.TOKEN &&
		(tk.TOKEN.toLowerCase() === 'in' || tk.TOKEN.toLowerCase() === 'do');

	// console.log({tk, startOfCommand, lastIsReservedWord, thirdInFor, thirdInCase, twoAgo})
	return startOfCommand || lastIsReservedWord || thirdInFor || thirdInCase;
}

module.exports = function reservedWords() {
	return compose(map((tk, idx, iterable) => {
		// TOKEN tokens consisting of a reserved word
		// are converted to their own token types
		if (isValidReservedWordPosition(tk, iterable) && hasOwnProperty(words, tk.TOKEN)) {
			tk[words[tk.TOKEN]] = tk.TOKEN;
			return copyTempObject(tk, {
				[words[tk.TOKEN]]: tk.TOKEN,
				loc: tk.loc
			});
		}

		// otherwise, TOKEN tokens are converted to
		// WORD tokens
		if (defined(tk.TOKEN)) {
			return copyTempObject(tk, {
				WORD: tk.TOKEN,
				loc: tk.loc
			});
		}

		// other tokens are amitted as-is
		return tk;
	}), lookahead.depth(2));
};
