'use strict';
const isOperator = require('./io-file-operators').isOperator;

function isValidName(text) {
	return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(text);
}

module.exports = () => function * identifySimpleCommandNames(tokens) {
	for (const tk of tokens) {
		if (tk._.maybeStartOfSimpleCommand) {
			if (tk.WORD && isValidName(tk.WORD)) {
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
				if (!commandNameFound && !isOperator(lastToken) && scTk.WORD && isValidName(scTk.WORD)) {
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
