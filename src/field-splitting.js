'use strict';

exports.mark = function markFieldSplitting(result, options) {
	if (typeof options.resolveEnv === 'function') {
		const ifs = options.resolveEnv('IFS');

		if (ifs !== null) {
			return result.replace(new RegExp(`[${ifs}]+`, 'g'), '\0');
		}
	}

	return result;
};

exports.split = function * resolveParameterExpansion(tokens) {
	for (const token of tokens) {
		if (token.WORD) {
			const fields = token.WORD.split('\0');
			if (fields.length > 1) {
				let idx = 0;
				for (const field of fields) {
					const fieldToken = JSON.parse(JSON.stringify(token));
					fieldToken.joined = fieldToken.WORD;
					fieldToken.WORD = field;
					fieldToken.fieldIdx = idx++;
					yield fieldToken;
				}
				continue;
			}
		}

		yield token;
	}
};

