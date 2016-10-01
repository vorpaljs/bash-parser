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
module.exports = function separator(options, utils) {
	// const appendTo = utils.tokens.appendTo;
	const changeTokenType = utils.tokens.changeTokenType;

	return function * (tokens) {
		let lastToken = {EMPTY: true, is: type => type === 'EMPTY'};

		for (let tk of tokens) {
			if (
				(
					tk.is('NEWLINE_LIST') ||
					tk.is('AND') ||
					tk.is('SEMICOLON') ||
					(tk.is('OPERATOR') && tk.value === ';') ||
					(tk.is('OPERATOR') && tk.value === '&')
				) && lastToken.is('SEPARATOR_OP')
			) {
				lastToken = changeTokenType(
					lastToken,
					'SEPARATOR_OP',
					lastToken.value + tk.value
				);
				if (lastToken.loc) {
					lastToken.loc.endLine++;
					lastToken.loc.endColumn = 0;
				}
				continue;
			}

			if (tk.is('SEMICOLON') || (tk.is('OPERATOR') && tk.value === ';')) {
				tk = changeTokenType(
					tk,
					'SEPARATOR_OP',
					tk.value
				);
			}

			if (tk.is('AND') || (tk.is('OPERATOR') && tk.value === '&')) {
				tk = changeTokenType(
					tk,
					'SEPARATOR_OP',
					tk.value
				);
			}

			if (!lastToken.is('EMPTY')) {
				yield lastToken;
			}
			lastToken = tk;
		}

		if (!lastToken.is('EMPTY')) {
			yield lastToken;
		}
	};
};
