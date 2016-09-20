'use strict';

/* resolve a conflict in grammar by tokenize linebreak+in
tokens as a new  linebreak_in */
module.exports = function linebreakIn(options, utils) {
	return function * (tokens) {
		let lastToken;

		for (const tk of tokens) {
			if (tk.In && lastToken.NEWLINE_LIST) {
				lastToken = utils.tokens.changeTokenType(
					lastToken,
					'LINEBREAK_IN',
					'\nin'
				);
				continue;
			}

			if (lastToken) {
				yield lastToken;
			}
			lastToken = tk;
		}

		if (lastToken) {
			yield lastToken;
		}
	};
};
