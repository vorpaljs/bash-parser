'use strict';
const babylon = require('babylon');

function setArithmeticExpansion(args) {
	const token = args.token;
	const expression = args.expression;
	const start = args.start;
	const end = args.end;

	const AST = babylon.parse(expression);
	const arithmeticAST = AST.program.body[0].expression;
	token.expansion = (token.expansion || []).concat({
		kind: 'arithmetic',
		expression,
		arithmeticAST,
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

	for (const currentCharacter of text) {
		if (!escaping) {
			if (!expandingArithmetic) {			// when no espanding is in progress
				if (expression === '' && currentCharacter === '$') {
					// start of expansion candidate
					expression = '$';
					startOfExpansion = currentCharIdx;
				} else if (expression === '$' && currentCharacter === '(') {
					expression = '$(';
				} else if (expression === '$(' && currentCharacter === '(') {
					// start of arithmetic expansion
					expandingArithmetic = true;
					expression = '';
				}
			} else if (currentCharacter === ')' && lastCharacter === ')') {
				expression = expression.slice(0, -1);
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
			} else {
				// accumulation
				expression += currentCharacter;
			}
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
module.exports = function * arithmeticExpansion(tokens) {
	for (const token of tokens) {
		if (token.WORD || token.ASSIGNMENT_WORD) {
			expandWord(token);
		}
		yield token;
	}
};
