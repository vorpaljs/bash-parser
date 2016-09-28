'use strict';

module.exports = () => function * defaultNodeType(tokens) {
	for (const token of tokens) {
		const tk = Object.assign({}, token);
		if (tk.type) {
			tk.originalType = tk.type;
			tk.type = tk.type.toLowerCase();
		}
		// Object.freeze(tk);
		yield tk;
	}
};
