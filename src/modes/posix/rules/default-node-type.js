'use strict';

module.exports = () => function * defaultNodeType(tokens) {
	for (const token of tokens) {
		const tk = Object.assign({}, token);
		if (tk.type) {
			tk.originalType = token.type;
			// console.log({defaultNodeType, tk})
			if (token.is('NAME')) {
				tk.type = token.type[0] + token.type.slice(1).toLowerCase();
			} else {
				tk.type = token.type.toLowerCase();
			}
		}
		// Object.freeze(tk);
		yield tk;
	}
};
