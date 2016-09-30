'use strict';
const isOperator = require('../enums/io-file-operators').isOperator;

module.exports = (options, utils) => function * identifySimpleCommandNames(tokens) {
	for (const tk of tokens) {
		if (tk._.maybeStartOfSimpleCommand) {
			if (tk.is('WORD') && utils.isValidName(tk.value)) {
				tk._.maybeSimpleCommandName = true;
				yield tk;
				continue;
			}

			yield tk;

			let lastToken = tk;
			let commandNameFound = false;
			let item = tokens.next();
			while (!item.done) {
				const scTk = item.value;
				if (!commandNameFound && !isOperator(lastToken) && scTk.is('WORD') && utils.isValidName(scTk.value)) {
					scTk._.maybeSimpleCommandName = true;
					// scTk.maybeSimpleCommandName = true;
					commandNameFound = true;
				}

				yield scTk;

				if (scTk.is('SEPARATOR_OP') || scTk.is('NEWLINE') || scTk.is('NEWLINE_LIST') || scTk.value === ';' ||
					scTk.is('PIPE') || scTk.is('OR_IF') || scTk.is('PIPE') || scTk.is('AND_IF')) {
					break;
				}

				lastToken = scTk;
				item = tokens.next();
			}
		} else {
			yield tk;
		}
	}
};
