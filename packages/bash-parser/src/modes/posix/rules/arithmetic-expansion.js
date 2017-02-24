/* eslint-disable camelcase */

import map from 'map-iterable';
import babylon from 'babylon';
import MagicString from 'magic-string';
import {tokens} from '../../../utils/index';
import {mark} from './field-splitting';

function parseArithmeticAST(xp) {
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

	return JSON.parse(JSON.stringify(expression));
}

const arithmeticExpansion = () => map(token => {
	if (token.is('WORD') || token.is('ASSIGNMENT_WORD')) {
		if (!token.expansion || token.expansion.length === 0) {
			return token;
		}

		return tokens.setExpansions(token, token.expansion.map(xp => {
			if (xp.type === 'arithmetic_expansion') {
				return Object.assign({}, xp, {arithmeticAST: parseArithmeticAST(xp)});
			}
			return xp;
		}));
	}
	return token;
});

arithmeticExpansion.resolve = options => map(token => {
	if (options.runArithmeticExpression && token.expansion) {
		const value = token.value;

		const magic = new MagicString(value);

		for (const xp of token.expansion) {
			if (xp.type === 'arithmetic_expansion') {
				const result = options.runArithmeticExpression(xp);
				magic.overwrite(
					xp.loc.start,
					xp.loc.end + 1,
					mark(result, value, options)
				);
				xp.resolved = true;
			}
		}

		return token.alterValue(magic.toString());
	}
	return token;
});

export default arithmeticExpansion;
