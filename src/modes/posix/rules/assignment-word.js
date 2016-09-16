'use strict';
const map = require('map-iterable');
const isValidName = require('../is-valid-name');
const copyTempObject = require('../copy-temp-object');

module.exports = function assignmentWord() {
	return map((tk, idx, ctx) => {
		// apply only on valid positions
		// (start of simple commands)
		if (tk._.maybeStartOfSimpleCommand) {
			ctx.commandPrefixNotAllowed = false;
		}

		// check if it is an assignment
		if (!ctx.commandPrefixNotAllowed && tk.WORD && tk.WORD.indexOf('=') > 0 && (
				// left part must be a valid name
				isValidName(tk.WORD.slice(0, tk.WORD.indexOf('=')))
			)) {
			return copyTempObject(tk, {
				ASSIGNMENT_WORD: tk.WORD,
				expansion: tk.expansion,
				loc: tk.loc
			});
		}

		ctx.commandPrefixNotAllowed = true;
		return tk;
	});
};
