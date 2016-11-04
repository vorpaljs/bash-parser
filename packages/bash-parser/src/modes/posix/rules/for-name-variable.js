import compose from 'compose-function';
import map from 'map-iterable';
import lookahead from 'iterable-lookahead';
import isValidName from '../../../utils/is-valid-name';

export default function forNameVariable() {
	return compose(map((tk, idx, iterable) => {
		let lastToken = iterable.behind(1) || {is: () => false};

		// if last token is For and current token form a valid name
		// type of token is changed from WORD to NAME

		if (lastToken.is('For') && tk.is('WORD') && isValidName(tk.value)) {
			return tk.changeTokenType('NAME', tk.value);
		}

		return tk;
	}), lookahead);
}
