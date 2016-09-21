'use strict';

module.exports = () => function * defaultNodeType(tokens) {
	for (const token of tokens) {
		const tk = Object.assign({}, token);
		if (tk.type) {
			tk.type = tk.type.toLowerCase();
		} else {
			if (tk.WORD) {
				tk.type = 'word';
			}

			if (tk.ASSIGNMENT_WORD) {
				tk.type = 'assignment_word';
			}

			if (tk.NAME) {
				tk.type = 'name';
			}
		}
		Object.freeze(tk);
		yield tk;
	}
};
