'use strict';

const map = require('map-iterable');
const pairs = require('object-pairs');
const MagicString = require('magic-string');
const tokensUtils = require('../../../utils/tokens');
const fieldSplitting = require('./field-splitting');

const parameterOps = {
	useDefaultValue: ':-',
	assignDefaultValue: ':=',
	indicateErrorIfNull: ':?',
	useAlternativeValue: ':+'
};

const EXPANDING = {
	NO: {},
	PARAMETER: {},
	COMMAND: {},
	ARITHMETIC: {}
};

const specialParameterNames = {
	'!': 'last-background-pid',
	'@': 'positional-list',
	'-': 'current-option-flags',
	'#': 'positional-count',
	'?': 'last-exit-status',
	'*': 'positional-string',
	'$': 'shell-process-id',
	'0': 'shell-script-name'
};

function isSpecialParameter(currentCharacter) {
	return currentCharacter.match(/^[0-9\-!@#\?\*\$]$/);
}

function setParameterExpansion(xp) {
	let parameter = xp.parameter;

	for (const pair of pairs(parameterOps)) {
		const opName = pair[0];
		const opChars = pair[1];
		// console.log({opChars, parameter})
		const pos = parameter.indexOf(opChars);

		if (pos !== -1) {
			const word = {text: parameter.slice(pos + 2)};

			parameter = parameter.slice(0, pos);

			/*
			// recursive expansion of operator argument
			word = expandWord({value: parameter.slice(pos + 2), WORD: parameter.slice(pos + 2)}, utils);
			word = Object.assign({}, word);
			word.text = word.WORD;
			delete word._;
			delete word.WORD;
			delete word.value;
			delete word.undefined;*/

			const op = opName;

			return {
				...xp,
				parameter,
				...(op ? {op} : {}),
				...(word ? {word} : {})
			};
		}
	}

	if (parameter.match(/^[0-9]+$/) && parameter !== '0') {
		return {
			...xp,
			kind: 'positional',
			parameter: Number(xp.parameter)
		};
	}

	if (isSpecialParameter(parameter)) {
		return {
			...xp,
			kind: specialParameterNames[parameter]
		};
	}

	return xp;
}

// RULE 5 - If the current character is an unquoted '$' or '`', the shell shall
// identify the start of any candidates for parameter expansion (Parameter Expansion),
// command substitution (Command Substitution), or arithmetic expansion (Arithmetic
// Expansion) from their introductory unquoted character sequences: '$' or "${", "$("
// or '`', and "$((", respectively.
const parameterExpansion = () => map(token => {
	if (token.is('WORD') || token.is('ASSIGNMENT_WORD')) {
		if (!token.expansion || token.expansion.length === 0) {
			return token;
		}

		return tokensUtils.setExpansions(token, token.expansion.map(xp => {
			if (xp.type === 'parameter_expansion') {
				return setParameterExpansion(xp, token);
			}

			return xp;
		}));
	}
	return token;
});

parameterExpansion.resolve = (options, utils) => function * resolveParameterExpansion(tokens) {
	for (let token of tokens) {
		if (options.resolveParameter && token.expansion) {
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
			token = utils.tokens.alterValue(token, magic.toString());
		}
		yield token;
	}
};

module.exports = parameterExpansion;
