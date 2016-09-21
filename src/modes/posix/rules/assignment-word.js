'use strict';
const map = require('map-iterable');

module.exports = function assignmentWord(options, utils) {
	return map((tk, idx, ctx) => {
		// apply only on valid positions
		// (start of simple commands)
		if (tk._.maybeStartOfSimpleCommand) {
			ctx.commandPrefixNotAllowed = false;
		}

		// check if it is an assignment
		if (!ctx.commandPrefixNotAllowed && tk.is('WORD') && tk.value.indexOf('=') > 0 && (
				// left part must be a valid name
				utils.isValidName(tk.value.slice(0, tk.value.indexOf('=')))
			)) {
			return utils.tokens.changeTokenType(tk, 'ASSIGNMENT_WORD', tk.value);
		}

		ctx.commandPrefixNotAllowed = true;
		return tk;
	});
};
