'use strict';

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

exports.split = (options, utils) => function * resolveParameterExpansion(tokens) {
	for (const token of tokens) {
		if (token.is('WORD')) {
			const fields = token.value.split('\0');
			if (fields.length > 1) {
				let idx = 0;
				for (const field of fields) {
					yield utils.tokens.mkFieldSplitToken(token, field, idx++);
				}
				continue;
			}
		}

		yield token;
	}
};

