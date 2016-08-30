'use strict';

module.exports = function * defaultNodeType(tokens) {
	for (const token of tokens) {
		if (token.WORD) {
			token.type = 'word';
		}

		if (token.ASSIGNMENT_WORD) {
			token.type = 'assignment_word';
		}

		if (token.NAME) {
			token.type = 'name';
		}

		yield token;
	}
};
