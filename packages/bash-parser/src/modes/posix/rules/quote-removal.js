import parse from 'shell-quote-word';
import unescape from 'unescape-js';
import map from 'map-iterable';
import {tokens} from '../../../utils/index';

function unquote(text) {
	const unquoted = parse(text);

	if (unquoted.length === 0) {
		return text;
	}

	if (unquoted[0].comment) {
		return '';
	}
	return unescape(unquoted[0]);
}

function unresolvedExpansions(token) {
	if (!token.expansion) {
		return false;
	}
	const unresolved = token.expansion.filter(xp => !xp.resolved);
	return unresolved.length > 0;
}

export default () => map(token => {
	if (token.is('WORD') || token.is('ASSIGNMENT_WORD')) {
		if (!unresolvedExpansions(token)) {
			return tokens.setValue(token, unquote(token.value));
		}
	}
	return token;
});
