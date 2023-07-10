'use strict';

const map = require('../../../vendored/map-iterable');
const MagicString = require('magic-string');
const tokensUtils = require('../../../utils/tokens');
const fieldSplitting = require('./field-splitting');

function setCommandExpansion(xp, token) {
	let command = xp.command;

	if (token.value[xp.loc.start - 1] === '`') {
		command = command.replace(/\\`/g, '`');
	}

	const bashParser = require('../../../index');

	const commandAST = bashParser(command);

	// console.log(JSON.stringify({command, commandAST}, null, 4))
	return Object.assign({}, xp, {command, commandAST});
}

// RULE 5 - If the current character is an unquoted '$' or '`', the shell shall
// identify the start of any candidates for parameter expansion (Parameter Expansion),
// command substitution (Command Substitution), or arithmetic expansion (Arithmetic
// Expansion) from their introductory unquoted character sequences: '$' or "${", "$("
// or '`', and "$((", respectively.

const commandExpansion = () => map(token => {
	if (token.is('WORD') || token.is('ASSIGNMENT_WORD')) {
		if (!token.expansion || token.expansion.length === 0) {
			return token;
		}

		return tokensUtils.setExpansions(token, token.expansion.map(xp => {
			if (xp.type === 'command_expansion') {
				return setCommandExpansion(xp, token);
			}

			return xp;
		}));
	}
	return token;
});

commandExpansion.resolve = options => map(token => {
	if (options.execCommand && token.expansion) {
		const value = token.value;

		const magic = new MagicString(value);

		for (const xp of token.expansion) {
			if (xp.type === 'command_expansion') {
				const result = options.execCommand(xp);
				// console.log({value, xp})
				magic.overwrite(
					xp.loc.start,
					xp.loc.end + 1,
					fieldSplitting.mark(result.replace(/\n+$/, ''), value, options)
				);
				xp.resolved = true;
			}
		}
		return token.alterValue(magic.toString());
	}
	return token;
});

module.exports = commandExpansion;
