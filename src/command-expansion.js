'use strict';
const MagicString = require('magic-string');

function setCommandExpansion(args) {
	const token = args.token;
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
				return;
			}
		}
	}

	if (expandingCommand === '`') {
		command = command.replace(/\\`/g, '`');
	}
	const bashParser = require('./index');

	token.expansion = (token.expansion || []).concat({
		type: 'command_expansion',
		command,
		commandAST: bashParser(command),
		start,
		end
	});
}

function expandWord(token) {
	const text = token.WORD || token.ASSIGNMENT_WORD;

	let expandingCommand = null;
	let expansion = null;
	let startOfExpansion = 0;
	let currentCharIdx = 0;
	let escaping = false;

	for (const currentCharacter of text) {
		if (!expandingCommand) {			// when no espanding is in progress
			if (!escaping && currentCharacter === '$' && expansion === null) {
				// start of expansion candidate
				expansion = '$';
				startOfExpansion = currentCharIdx;
			} else if (!escaping && currentCharacter === '`' && expansion === null) {
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
				setCommandExpansion({
					token,
					commandText: expansion,
					start: startOfExpansion,
					end: startOfExpansion + expansion.length + 3,  // add 3 to take in account $()
					expandingCommand
				});

				startOfExpansion = 0;
				expandingCommand = null;
				expansion = null;
			} else if (!escaping && currentCharacter === '`' && expandingCommand === '`') {
				// end of command expansion
				setCommandExpansion({
					token,
					commandText: expansion,
					start: startOfExpansion,
					end: startOfExpansion + expansion.length + 2,  // add 2 to take in account ``
					expandingCommand
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
}

// RULE 5 - If the current character is an unquoted '$' or '`', the shell shall
// identify the start of any candidates for parameter expansion (Parameter Expansion),
// command substitution (Command Substitution), or arithmetic expansion (Arithmetic
// Expansion) from their introductory unquoted character sequences: '$' or "${", "$("
// or '`', and "$((", respectively.

function * commandExpansion(tokens) {
	for (const token of tokens) {
		if (token.WORD || token.ASSIGNMENT_WORD) {
			expandWord(token);
		}
		yield token;
	}
}

commandExpansion.resolve = options => function * resolveParameterExpansion(tokens) {
	for (const token of tokens) {
		if (options.execCommand && token.expansion) {
			const value = token.WORD || token.ASSIGNMENT_WORD;
			const resultProp = token.WORD ? 'WORD' : 'ASSIGNMENT_WORD';

			token.magic = new MagicString(value);
			token.originalText = token.originalText || value;

			for (const xp of token.expansion) {
				if (xp.type === 'command_expansion') {
					const result = options.execCommand(xp);
					token.magic.overwrite(
						xp.start,
						xp.end,
						result.replace(/\n+$/, '')
					);
					xp.resolved = true;
				}
			}
			token[resultProp] = token.magic.toString();
			delete token.magic;
		}
		yield token;
	}
};

module.exports = commandExpansion;
