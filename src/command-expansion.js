'use strict';

const EXPANDING = {
	NO: {},
	PARAMETER: {},
	COMMAND: {},
	ARITHMETIC: {}
};

function setCommandExpansion(token, commandText, start, end) {
	let command = commandText;
	let word;
	let op;

	token.expansion = (token.expansion || []).concat({
		kind: 'command',
		command,
		word,
		op,
		start,
		end
	});
}

function expandWord(token) {
	const text = token.WORD || token.ASSIGNMENT_WORD;

	let expanding = EXPANDING.NO;
	let expansion = null;
	let startOfExpansion = 0;
	let currentCharIdx = 0;

	for (const currentCharacter of text) {
		if (expanding === EXPANDING.NO) {			// when no espanding is in progress
			if (currentCharacter === '$' && expansion === null) {
				// start of expansion candidate
				expansion = '$';
				startOfExpansion = currentCharIdx;
			} else if (expansion === '$' && currentCharacter === '(') {
				// start of command expansion
				expanding = EXPANDING.COMMAND;
				expansion = '';
			}
		} else if (expanding === EXPANDING.COMMAND) {
			if (currentCharacter === ')') {
				// end of command expansion
				setCommandExpansion(
					token,
					expansion,
					startOfExpansion,
					startOfExpansion + expansion.length + 3  // add 3 to take in account $()
				);

				startOfExpansion = 0;
				expanding = EXPANDING.NO;
				expansion = null;
			} else {
				// accumulation
				expansion += currentCharacter;
			}
		}

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
