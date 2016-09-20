'use strict';
const isOperator = require('../enums/io-file-operators').isOperator;

module.exports = (options, utils) => function * identifySimpleCommandNames(tokens) {
	for (const tk of tokens) {
		if (tk._.maybeStartOfSimpleCommand) {
			if (tk.WORD && utils.isValidName(tk.WORD)) {
				tk._.maybeSimpleCommandName = true;
				// tk.maybeSimpleCommandName = true;
				yield tk;
				continue;
			}

			yield tk;

			let lastToken = tk;
			let commandNameFound = false;
			let item = tokens.next();
			while (!item.done) {
				const scTk = item.value;
				if (!commandNameFound && !isOperator(lastToken) && scTk.WORD && utils.isValidName(scTk.WORD)) {
					scTk._.maybeSimpleCommandName = true;
					// scTk.maybeSimpleCommandName = true;
					commandNameFound = true;
				}

				yield scTk;

				if (scTk.SEPARATOR_OP || scTk.NEWLINE || scTk.NEWLINE_LIST || scTk.TOKEN === ';' ||
					scTk.PIPE || scTk.OR_IF || scTk.PIPE || scTk.AND_IF) {
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
