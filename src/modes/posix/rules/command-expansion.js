'use strict';
const MagicString = require('magic-string');
const fieldSplitting = require('./field-splitting');

function setCommandExpansion(args) {
	let token = args.token;
	const commandText = args.commandText;
	const start = args.start;
	const end = args.end;
	const expandingCommand = args.expandingCommand;

	let command = commandText;

	// skip command expansion if there
	// is already an arithmetic expansion defined
	// on same position
	if (token.expansion) {
		for (const exp of token.expansion) {
			if (exp.start <= start && exp.end >= end && exp.type === 'arithmetic_expansion') {
				return token;
			}
		}
	}

	if (expandingCommand === '`') {
		command = command.replace(/\\`/g, '`');
	}
	const bashParser = require('../../../index');

	if (!token.expansion) {
		token = args.addExpansions(token);
	}

	token.expansion.push({
		type: 'command_expansion',
		command,
		commandAST: bashParser(command),
		start,
		end
	});

	return token;
}

function expandWord(token, addExpansions) {
	const text = token.value;

	let expandingCommand = null;
	let expansion = null;
	let startOfExpansion = 0;
	let currentCharIdx = 0;
	let escaping = false;
	let quoting = '';

	for (const currentCharacter of text) {
		if (!expandingCommand) {			// when no espanding is in progress
			if (!escaping && currentCharacter === '$' && expansion === null && quoting !== '\'') {
				// start of expansion candidate
				expansion = '$';
				startOfExpansion = currentCharIdx;
			} else if (!escaping && (currentCharacter === '\'' || currentCharacter === '"')) {
				if (quoting === currentCharacter) {
					quoting = '';
				} else if (quoting === '') {
					quoting = currentCharacter;
				}
			} else if (!escaping && currentCharacter === '`' && expansion === null && quoting !== '\'') {
				// start of expansion candidate
				expandingCommand = '`';
				expansion = '';
				startOfExpansion = currentCharIdx;
			} else if (expansion === '$' && !escaping && currentCharacter === '(') {
				// start of command expansion
				expandingCommand = '$';
				expansion = '';
			}
		} else if (expandingCommand) {
			if (!escaping && currentCharacter === ')' && expandingCommand === '$') {
				// end of command expansion
				token = setCommandExpansion({
					token,
					commandText: expansion,
					start: startOfExpansion,
					end: startOfExpansion + expansion.length + 3,  // add 3 to take in account $()
					expandingCommand,
					addExpansions
				});

				startOfExpansion = 0;
				expandingCommand = null;
				expansion = null;
			} else if (!escaping && currentCharacter === '`' && expandingCommand === '`') {
				// end of command expansion
				token = setCommandExpansion({
					token,
					commandText: expansion,
					start: startOfExpansion,
					end: startOfExpansion + expansion.length + 2,  // add 2 to take in account ``
					expandingCommand,
					addExpansions
				});

				startOfExpansion = 0;
				expandingCommand = null;
				expansion = null;
			} else {
				// accumulation
				expansion += currentCharacter;
			}
		}
		escaping = currentCharacter === '\\';

		currentCharIdx++;
	}

	return token;
}

// RULE 5 - If the current character is an unquoted '$' or '`', the shell shall
// identify the start of any candidates for parameter expansion (Parameter Expansion),
// command substitution (Command Substitution), or arithmetic expansion (Arithmetic
// Expansion) from their introductory unquoted character sequences: '$' or "${", "$("
// or '`', and "$((", respectively.

const commandExpansion = (options, utils) => function * commandExpansion(tokens) {
	for (let token of tokens) {
		if (token.is('WORD') || token.is('ASSIGNMENT_WORD')) {
			token = expandWord(token, utils.tokens.addExpansions);
		}
		yield token;
	}
};

commandExpansion.resolve = (options, utils) => function * resolveParameterExpansion(tokens) {
	for (let token of tokens) {
		if (options.execCommand && token.expansion) {
			const value = token.value;

			const magic = new MagicString(value);

			for (const xp of token.expansion) {
				if (xp.type === 'command_expansion') {
					const result = options.execCommand(xp);
					magic.overwrite(
						xp.start,
						xp.end,
						fieldSplitting.mark(result.replace(/\n+$/, ''), value, options)
					);
					xp.resolved = true;
				}
			}
			token = utils.tokens.alterValue(token, magic.toString());
		}
		yield token;
	}
};

module.exports = commandExpansion;
