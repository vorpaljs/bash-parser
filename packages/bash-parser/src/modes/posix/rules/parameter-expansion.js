'use strict';
const mapObj = require('map-obj');
const map = require('map-iterable');
const pairs = require('object-pairs');
const MagicString = require('magic-string');
const tokens = require('../../../utils/tokens');
const fieldSplitting = require('./field-splitting');

const handleParameter = (obj, match) => {
	const ret = mapObj(obj, (k, v) => {
		if (typeof v === 'function') {
			return [k, v(match)];
		}

		if (typeof v === 'object') {
			return [k, handleParameter(v, match)];
		}

		return [k, v];
	});

	delete ret.expand;

	return ret;
};

function expandParameter(xp, enums) {
	let parameter = xp.parameter;

	for (const pair of pairs(enums.parameterOperators)) {
		const re = new RegExp(pair[0]);

		const match = parameter.match(re);

		if (match) {
			const opProps = handleParameter(pair[1], match);

			/*
			// recursive expansion of operator argument
			word = expandWord({value: parameter.slice(pos + 2), WORD: parameter.slice(pos + 2)}, utils);
			word = Object.assign({}, word);
			word.text = word.WORD;
			delete word._;
			delete word.WORD;
			delete word.value;
			delete word.undefined;*/

			return Object.assign(
				xp,
				opProps
			);
		}
	}

	return xp;
}

// RULE 5 - If the current character is an unquoted '$' or '`', the shell shall
// identify the start of any candidates for parameter expansion (Parameter Expansion),
// command substitution (Command Substitution), or arithmetic expansion (Arithmetic
// Expansion) from their introductory unquoted character sequences: '$' or "${", "$("
// or '`', and "$((", respectively.
const parameterExpansion = (options, mode) => map(token => {
	if (token.is('WORD') || token.is('ASSIGNMENT_WORD')) {
		if (!token.expansion || token.expansion.length === 0) {
			return token;
		}

		return tokens.setExpansions(token, token.expansion.map(xp => {
			if (xp.type === 'parameter_expansion') {
				return expandParameter(xp, mode.enums);
			}

			return xp;
		}));
	}
	return token;
});

parameterExpansion.resolve = options => map(token => {
	if (token.is('WORD') || token.is('ASSIGNMENT_WORD')) {
		if (!options.resolveParameter || !token.expansion || token.expansion.length === 0) {
			return token;
		}

		const value = token.value;

		const magic = new MagicString(value);
		for (const xp of token.expansion) {
			if (xp.type === 'parameter_expansion') {
				const result = options.resolveParameter(xp);
				xp.resolved = true;
				magic.overwrite(
					xp.loc.start,
					xp.loc.end + 1,
					fieldSplitting.mark(result, value, options)
				);
			}
		}
		return tokens.alterValue(token, magic.toString());
	}
	return token;
});

module.exports = parameterExpansion;
