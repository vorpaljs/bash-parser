import toPascal from 'to-pascal-case';
import map from 'map-iterable';

export default () => map(token => {
	const tk = Object.assign({}, token);
	if (tk.type) {
		tk.originalType = token.type;
		// console.log({defaultNodeType, tk})
		if (token.is('WORD') || token.is('NAME') || token.is('ASSIGNMENT_WORD')) {
			tk.type = toPascal(tk.type);
		} else {
			tk.type = token.type.toLowerCase();
		}

		for (const xp of tk.expansion || []) {
			xp.type = toPascal(xp.type);
		}

		delete tk._;
	}
	// Object.freeze(tk);
	return tk;
});

