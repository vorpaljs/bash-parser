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

function setParameterExpansion(token, parameterText, start, end, utils) {
	let parameter = parameterText;
	let word;
	let op;
	if (!token.expansion) {
		token = utils.tokens.addExpansions(token);
	}
	const expansions = token.expansion;

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

		return token;
	}
	if (isSpecialParameter(parameter)) {
		appendXp({
			kind: specialParameterNames[parameter],
			parameter: parameter,
			start,
			end
		}, word, op);

		return token;
	}

	for (const pair of pairs(parameterOps)) {
		const opName = pair[0];
		const opChars = pair[1];

		const pos = parameterText.indexOf(opChars);

		if (pos !== -1) {
			parameter = parameterText.slice(0, pos);

			// recursive expansion of operator argument
			word = expandWord({value: parameterText.slice(pos + 2), WORD: parameterText.slice(pos + 2)}, utils);
			word = Object.assign({}, word);
			word.text = word.WORD;
			delete word._;
			delete word.WORD;
			delete word.value;
			delete word.undefined;

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

	return token;
}

function expandWord(token, utils) {
	const text = token.value;

	let expanding = EXPANDING.NO;
	let expansion = null;
	let startOfExpansion = 0;
	let candidateParameterName = '';
	let currentCharIdx = 0;
	let quoting = '';
	let escaping = false;

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
				token = setParameterExpansion(
					token,
					candidateParameterName,
					startOfExpansion,
					startOfExpansion + candidateParameterName.length + 1,  // add 1 to take in account $
					utils
				);
				expansion = null;
				candidateParameterName = '';
			}
			expansion = null;
			startOfExpansion = 0;
		}
	}

	for (const currentCharacter of text) {
		if (!escaping && expanding === EXPANDING.NO) {			// when no espanding is in progress
			if (currentCharacter === '$' && expansion === null && quoting !== '\'') {
				// start of expansion candidate
				expansion = '$';
				startOfExpansion = currentCharIdx;
			} else if (currentCharacter === '\'' || currentCharacter === '"') {
				if (quoting === currentCharacter) {
					quoting = '';
				} else if (quoting === '') {
					quoting = currentCharacter;
				}
			} else if (expansion === '$') {
				expansionCandidateInProgress(currentCharacter);
			}
		} else if (expanding === EXPANDING.PARAMETER) {
			if (!escaping && currentCharacter === '}') {
				// end of parameter expansion
				token = setParameterExpansion(
					token,
					expansion,
					startOfExpansion,
					startOfExpansion + expansion.length + 3,  // add 3 to take in account ${}
					utils
				);

				startOfExpansion = 0;
				expanding = EXPANDING.NO;
				expansion = null;
			} else {
				// accumulation
				expansion += currentCharacter;
			}
		}

		escaping = currentCharacter === '\\';
		currentCharIdx++;
	}

	if (candidateParameterName !== '') {
		// we have already accumulated a valid name for parameter expansion, use it
		token = setParameterExpansion(
			token,
			candidateParameterName,
			startOfExpansion,
			startOfExpansion + candidateParameterName.length + 1,  // add 1 to take in account $
			utils
		);

		expansion = null;
	}

	return token;
}

// RULE 5 - If the current character is an unquoted '$' or '`', the shell shall
// identify the start of any candidates for parameter expansion (Parameter Expansion),
// command substitution (Command Substitution), or arithmetic expansion (Arithmetic
// Expansion) from their introductory unquoted character sequences: '$' or "${", "$("
// or '`', and "$((", respectively.
const parameterExpansion = (options, utils) => function * parameterExpansion(tokens) {
	for (let token of tokens) {
		if (token.is('WORD') || token.is('ASSIGNMENT_WORD')) {
			token = expandWord(token, utils);
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
						xp.start,
						xp.end,
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
