'use strict';
const pairs = require('object-pairs');
const MagicString = require('magic-string');
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
	let word;
	let op;

	for (const pair of pairs(parameterOps)) {
		const opName = pair[0];
		const opChars = pair[1];

		const pos = parameter.indexOf(opChars);

		if (pos !== -1) {
			parameter = parameter.slice(0, pos);

			// recursive expansion of operator argument
			/*word = expandWord({value: parameter.slice(pos + 2), WORD: parameter.slice(pos + 2)}, utils);
			word = Object.assign({}, word);
			word.text = word.WORD;
			delete word._;
			delete word.WORD;
			delete word.value;
			delete word.undefined;*/

			op = opName;
			// only one operators is allowed
			break;
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
			kind: specialParameterNames[parameter],
			...(op ? {op} : {}),
			...(word ? {word} : {})
		};
	}

	return xp;
}

// RULE 5 - If the current character is an unquoted '$' or '`', the shell shall
// identify the start of any candidates for parameter expansion (Parameter Expansion),
// command substitution (Command Substitution), or arithmetic expansion (Arithmetic
// Expansion) from their introductory unquoted character sequences: '$' or "${", "$("
// or '`', and "$((", respectively.
const parameterExpansion = () => function * parameterExpansion(tokens) {
	for (let token of tokens) {
		if (token.is('WORD') || token.is('ASSIGNMENT_WORD')) {
			if (!token.expansion || token.expansion.length === 0) {
				return token;
			}

			return tokens.setExpansions(token, token.expansion.map(xp => {
				if (xp.type === 'parameter_expansion') {
					return setParameterExpansion(xp);
				}
				return xp;
			}));
		}

		yield token;
	}
};

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
