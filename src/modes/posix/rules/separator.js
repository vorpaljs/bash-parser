'use strict';

/*
resolve a conflict in grammar by
tokenize the former rule:

separator_op     : '&'
				 | ';'
				 ;
separator       : separator_op
				 | separator_op NEWLINE_LIST
				 | NEWLINE_LIST

with a new separator_op token, the rule became:

separator : separator_op
				 | NEWLINE_LIST
*/
module.exports = function separator() {
	return function * (tokens) {
		let lastToken = {EMPTY: true};

		for (const tk of tokens) {
			if (tk.NEWLINE_LIST && lastToken.SEPARATOR_OP) {
				lastToken.SEPARATOR_OP += tk.NEWLINE_LIST;
				if (lastToken.loc) {
					lastToken.loc.endLine++;
					lastToken.loc.endColumn = 0;
				}
				continue;
			}

			if (tk[';'] || tk.OPERATOR === '&' || tk.OPERATOR === ';' || tk.TOKEN === ';' || tk.WORD === ';') {
				tk.SEPARATOR_OP = (tk[';'] || '') + (tk.OPERATOR || '') + (tk.TOKEN || '');

				delete tk[';'];
				delete tk.OPERATOR;
				delete tk.TOKEN;
			}

			if (!lastToken.EMPTY) {
				yield lastToken;
			}
			lastToken = tk;
		}

		if (!lastToken.EMPTY) {
			yield lastToken;
		}
	};
};
