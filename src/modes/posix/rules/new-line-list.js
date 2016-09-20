'use strict';

/* resolve a conflict in grammar by tokenize multiple NEWLINEs as a
newline_list token (it was a rule in POSIX grammar) */
module.exports = function newLineList(options, utils) {
	const mkToken = utils.tokens.mkToken;
	const appendTo = utils.tokens.appendTo;
	const changeTokenType = utils.tokens.changeTokenType;

	return function * (tokens) {
		let lastToken = mkToken('EMPTY', true);
		for (let tk of tokens) {
			if (tk.NEWLINE) {
				if (lastToken.NEWLINE_LIST) {
					lastToken = appendTo(lastToken, '\n');
					if (lastToken.loc) {
						lastToken.loc.endLine++;
					}
					continue;
				} else {
					tk = changeTokenType(tk, 'NEWLINE_LIST', '\n');
				}
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

