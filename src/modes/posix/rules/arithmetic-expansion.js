'use strict';
/* eslint-disable camelcase */

const babylon = require('babylon');
const MagicString = require('magic-string');
const fieldSplitting = require('./field-splitting');

function setArithmeticExpansion(args) {
	const token = args.token;
	const expression = args.expression;
	const start = args.start;
	const end = args.end;
	let AST;
	try {
		AST = babylon.parse(expression);
	} catch (err) {
		throw new SyntaxError(`Cannot parse arithmetic expression "${expression}": ${err.message}`);
	}

	const arithmeticAST = AST.program.body[0].expression;

	if (arithmeticAST === undefined) {
		throw new SyntaxError(`Cannot parse arithmetic expression "${expression}": Not an expression`);
	}

	token.expansion = (token.expansion || []).concat({
		type: 'arithmetic_expansion',
		expression,
		arithmeticAST: JSON.parse(JSON.stringify(arithmeticAST)),
		start,
		end
	});
}

function expandWord(token) {
	const text = token.WORD || token.ASSIGNMENT_WORD;

	let expandingArithmetic = false;
	let expression = '';
	let startOfExpansion = 0;
	let currentCharIdx = 0;
	let escaping = false;
	let lastCharacter = null;
	let quoting = '';

	for (const currentCharacter of text) {
		if ((!escaping) && (!expandingArithmetic)) {			// when no espanding is in progress
			if (expression === '' && currentCharacter === '$' && quoting !== '\'') {
				// start of expansion candidate
				expression = '$';
				startOfExpansion = currentCharIdx;
			} else if (currentCharacter === '\'' || currentCharacter === '"') {
				if (quoting === currentCharacter) {
					quoting = '';
				} else if (quoting === '') {
					quoting = currentCharacter;
				}
			} else if (expression === '$' && currentCharacter === '(') {
				expression = '$(';
			} else if (expression === '$(' && currentCharacter === '(') {
				// start of arithmetic expansion
				expandingArithmetic = true;
				expression = '+';
			}
		} else if ((!escaping) && currentCharacter === ')' && lastCharacter === ')') {
			expression = expression.slice(1, -1);
			// end of command expansion
			setArithmeticExpansion({
				token,
				expression: expression,
				start: startOfExpansion,
				end: startOfExpansion + expression.length + 5  // add 3 to take in account $(())
			});
			startOfExpansion = 0;
			expandingArithmetic = false;
			expression = '';
		} else if (expression !== '') {
			// accumulation
			expression += currentCharacter;
		}

		escaping = currentCharacter === '\\';
		lastCharacter = currentCharacter;
		currentCharIdx++;
	}
}

// RULE 5 - If the current character is an unquoted '$' or '`', the shell shall
// identify the start of any candidates for parameter expansion (Parameter Expansion),
// command substitution (Command Substitution), or arithmetic expansion (Arithmetic
// Expansion) from their introductory unquoted character sequences: '$' or "${", "$("
// or '`', and "$((", respectively.
const arithmeticExpansion = () => function * arithmeticExpansion(tokens) {
	for (const token of tokens) {
		if (token.WORD || token.ASSIGNMENT_WORD) {
			expandWord(token);
		}
		yield token;
	}
};

arithmeticExpansion.resolve = options => function * resolveParameterExpansion(tokens) {
	for (const token of tokens) {
		if (options.runArithmeticExpression && token.expansion) {
			const value = token.WORD || token.ASSIGNMENT_WORD;
			const resultProp = token.WORD ? 'WORD' : 'ASSIGNMENT_WORD';

			token.magic = new MagicString(value);
			token.originalText = token.originalText || value;

			for (const xp of token.expansion) {
				if (xp.type === 'arithmetic_expansion') {
					const result = options.runArithmeticExpression(xp);
					token.magic.overwrite(
						xp.start,
						xp.end,
						fieldSplitting.mark(result, value, options)
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

module.exports = arithmeticExpansion;