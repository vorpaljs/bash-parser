'use strict';
const map = require('../../../vendored/map-iterable');
const isValidName = require('../../../utils/is-valid-name');

module.exports = function assignmentWord() {
	return map((tk, idx, ctx) => {
		// apply only on valid positions
		// (start of simple commands)
		if (tk._.maybeStartOfSimpleCommand) {
			ctx.commandPrefixNotAllowed = false;
		}

		// check if it is an assignment
		if (!ctx.commandPrefixNotAllowed && tk.is('WORD') && tk.value.indexOf('=') > 0 && (
				// left part must be a valid name
				isValidName(tk.value.slice(0, tk.value.indexOf('=')))
			)) {
			return tk.changeTokenType('ASSIGNMENT_WORD', tk.value);
		}

		ctx.commandPrefixNotAllowed = true;
		return tk;
	});
};
