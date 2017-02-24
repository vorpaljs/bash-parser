import map from 'map-iterable';
import merge from 'transform-spread-iterable';
import compose from 'compose-function';
import {mkFieldSplitToken} from '../../../utils/tokens';

export function mark(result, text, options) {
	if (typeof options.resolveEnv === 'function' &&
			text[0] !== '\'' && text[0] !== '"'
		) {
		const ifs = options.resolveEnv('IFS');

		if (ifs !== null) {
			return result.replace(new RegExp(`[${ifs}]+`, 'g'), '\0');
		}
	}

	return result;
}

export const split = () => compose(
	merge,
	map(token => {
		if (token.is('WORD')) {
			const fields = token.value.split('\0');
			if (fields.length > 1) {
				let idx = 0;
				return fields.map(field =>
					mkFieldSplitToken(token, field, idx++)
				);
			}
		}

		return token;
	})
);

