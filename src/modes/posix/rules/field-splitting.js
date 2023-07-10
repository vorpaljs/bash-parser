'use strict';

const map = require('../../../vendored/map-iterable');
const merge = require('../../../vendored/transform-spread-iterable');
const compose = require('compose-function');
const mkFieldSplitToken = require('../../../utils/tokens').mkFieldSplitToken;

exports.mark = function markFieldSplitting(result, text, options) {
	if (typeof options.resolveEnv === 'function' &&
			text[0] !== '\'' && text[0] !== '"'
		) {
		const ifs = options.resolveEnv('IFS');

		if (ifs !== null) {
			return result.replace(new RegExp(`[${ifs}]+`, 'g'), '\0');
		}
	}

	return result;
};

exports.split = () => compose(
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
