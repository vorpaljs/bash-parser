'use strict';
const pairs = require('object-pairs');
const MagicString = require('magic-string');

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

function setParameterExpansion(token, parameterText, start, end) {
	let parameter = parameterText;
	let word;
	let op;
	const expansions = token.expansion = (token.expansion || []);

	function appendXp(xp, word, op) {
		if (word !== undefined) {
			xp.word = word;
		}

		if (op !== undefined) {
			xp.op = op;
		}
		xp.type = 'parameter_expansion';
		expansions.push(xp);
	}

	if (parameter.match(/^[0-9]+$/) && parameter !== '0') {
		appendXp({
			kind: 'positional',
			parameter: Number(parameter),
			start,
			end
		}, word, op);

		return;
	}

	if (isSpecialParameter(parameter)) {
		appendXp({
			kind: specialParameterNames[parameter],
			parameter: parameter,
			start,
			end
		}, word, op);

		return;
	}

	for (const pair of pairs(parameterOps)) {
		const opName = pair[0];
		const opChars = pair[1];

		const pos = parameterText.indexOf(opChars);

		if (pos !== -1) {
			parameter = parameterText.slice(0, pos);

			// recursive expansion of operator argument
			word = {WORD: parameterText.slice(pos + 2)};
			expandWord(word);
			word.text = word.WORD;
			delete word.WORD;

			op = opName;
			// only one operators is allowed
			break;
		}
	}

	appendXp({
		parameter,
		start,
		end
	}, word, op);
}

function expandWord(token) {
	const text = token.WORD || token.ASSIGNMENT_WORD;

	let expanding = EXPANDING.NO;
	let expansion = null;
	let startOfExpansion = 0;
	let candidateParameterName = '';
	let currentCharIdx = 0;

	function charCouldBePartOfName(currentCharacter) {
		if (candidateParameterName === '' && currentCharacter.match(/^[a-zA-z_]$/)) {
			return true;
		}

		if (candidateParameterName === '' && isSpecialParameter(currentCharacter)) {
			// positional, single digit parameter
			return true;
		}

		if (isSpecialParameter(candidateParameterName)) {
			// positional, single digit parameter allowed if not brace quoted
			// reset candidateParameterName
			// candidateParameterName = '';
			return false;
		}

		if (candidateParameterName !== '' && currentCharacter.match(/^[a-zA-z_0-9]$/)) {
			return true;
		}

		return false;
	}

	function expansionCandidateInProgress(currentCharacter) {
		if (currentCharacter === '{') {
			// start of parameter expansion quoted by braces
			expanding = EXPANDING.PARAMETER;
			expansion = '';
		} else if (charCouldBePartOfName(currentCharacter)) {
			candidateParameterName += currentCharacter;
		} else {
			// this character could not be part of a name
			if (candidateParameterName !== '') {
				// we have already accumulated a valid name, use it
				// end of parameter expansion
				setParameterExpansion(
					token,
					candidateParameterName,
					startOfExpansion,
					startOfExpansion + candidateParameterName.length + 1  // add 1 to take in account $
				);
				expansion = null;
				candidateParameterName = '';
			}
			expansion = null;
			startOfExpansion = 0;
		}
	}

	for (const currentCharacter of text) {
		if (expanding === EXPANDING.NO) {			// when no espanding is in progress
			if (currentCharacter === '$' && expansion === null) {
				// start of expansion candidate
				expansion = '$';
				startOfExpansion = currentCharIdx;
			} else if (expansion === '$') {
				expansionCandidateInProgress(currentCharacter);
			}
		} else if (expanding === EXPANDING.PARAMETER) {
			if (currentCharacter === '}') {
				// end of parameter expansion
				setParameterExpansion(
					token,
					expansion,
					startOfExpansion,
					startOfExpansion + expansion.length + 3  // add 3 to take in account ${}
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

	if (candidateParameterName !== '') {
		// we have already accumulated a valid name for parameter expansion, use it
		setParameterExpansion(
			token,
			candidateParameterName,
			startOfExpansion,
			startOfExpansion + candidateParameterName.length + 1  // add 1 to take in account $
		);

		expansion = null;
	}
}

// RULE 5 - If the current character is an unquoted '$' or '`', the shell shall
// identify the start of any candidates for parameter expansion (Parameter Expansion),
// command substitution (Command Substitution), or arithmetic expansion (Arithmetic
// Expansion) from their introductory unquoted character sequences: '$' or "${", "$("
// or '`', and "$((", respectively.
function * parameterExpansion(tokens) {
	for (const token of tokens) {
		if (token.WORD || token.ASSIGNMENT_WORD) {
			expandWord(token);
		}
		yield token;
	}
}

parameterExpansion.resolve = options => function * resolveParameterExpansion(tokens) {
	for (const token of tokens) {
		if (options.resolveParameter && token.expansion) {
			const value = token.WORD || token.ASSIGNMENT_WORD;
			const resultProp = token.WORD ? 'WORD' : 'ASSIGNMENT_WORD';

			token.magic = new MagicString(value);
			token.originalText = token.originalText || value;

			for (const xp of token.expansion) {
				if (xp.type === 'parameter_expansion') {
					const result = options.resolveParameter(xp);
					token.magic.overwrite(xp.start, xp.end, result);
					xp.resolved = true;
				}
			}
			token[resultProp] = token.magic.toString();
			delete token.magic;
		}
		yield token;
	}
};

module.exports = parameterExpansion;
