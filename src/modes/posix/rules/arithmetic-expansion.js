'use strict';
/* eslint-disable camelcase */

const map = require('map-iterable');
const babylon = require('babylon');
const MagicString = require('magic-string');
const tokens = require('../../../utils/tokens');
const fieldSplitting = require('./field-splitting');

function setArithmeticExpansion(xp) {
	let AST;
	try {
		AST = babylon.parse(xp.expression);
	} catch (err) {
		throw new SyntaxError(`Cannot parse arithmetic expression "${xp.expression}": ${err.message}`);
	}

	const expression = AST.program.body[0].expression;

	if (expression === undefined) {
		throw new SyntaxError(`Cannot parse arithmetic expression "${xp.expression}": Not an expression`);
	}

	const arithmeticAST = JSON.parse(JSON.stringify(expression));

	return {...xp, arithmeticAST};
}

// RULE 5 - If the current character is an unquoted '$' or '`', the shell shall
// identify the start of any candidates for parameter expansion (Parameter Expansion),
// command substitution (Command Substitution), or arithmetic expansion (Arithmetic
// Expansion) from their introductory unquoted character sequences: '$' or "${", "$("
// or '`', and "$((", respectively.
const arithmeticExpansion = () => map(token => {
	if (token.is('WORD') || token.is('ASSIGNMENT_WORD')) {
		if (!token.expansion || token.expansion.length === 0) {
			return token;
		}

		return tokens.setExpansions(token, token.expansion.map(xp => {
			if (xp.type === 'arithmetic_expansion') {
				return setArithmeticExpansion(xp);
			}
			return xp;
		}));
	}
	return token;
});

arithmeticExpansion.resolve = (options, utils) => map(token => {
	if (options.runArithmeticExpression && token.expansion) {
		const value = token.value;

		const magic = new MagicString(value);

		for (const xp of token.expansion) {
			if (xp.type === 'arithmetic_expansion') {
				const result = options.runArithmeticExpression(xp);
				magic.overwrite(
					xp.loc.start,
					xp.loc.end + 1,
					fieldSplitting.mark(result, value, options)
				);
				xp.resolved = true;
			}
		}
		return utils.tokens.alterValue(token, magic.toString());
	}
	return token;
});

module.exports = arithmeticExpansion;
