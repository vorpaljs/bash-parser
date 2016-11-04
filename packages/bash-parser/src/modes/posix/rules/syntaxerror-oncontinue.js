import map from 'map-iterable';

export default function syntaxerrorOnContinue() {
	return map(tk => {
		if (tk && tk.is('CONTINUE')) {
			throw new SyntaxError('Unclosed ' + tk.value);
		}

		return tk;
	});
}
