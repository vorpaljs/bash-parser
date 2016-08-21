'use strict';
function setCommandExpansion({token, commandText, start, end, expandingCommand}) {
	let command = commandText;
	let word;
	let op;

	if (expandingCommand === '`') {
		command = command.replace(/\\`/g, '`');
	}
	const bashParser = require('./index');

	token.expansion = (token.expansion || []).concat({
		kind: 'command',
		command,
		commandAST: bashParser(command),
		word,
		op,
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

module.exports = function * commandExpansion(tokens) {
	for (const token of tokens) {
		if (token.WORD || token.ASSIGNMENT_WORD) {
			expandWord(token);
		}
		yield token;
	}
};
