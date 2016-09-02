'use strict';
const test = require('ava');
const bashParser = require('../src');
// const utils = require('./_utils');

/* eslint-disable camelcase */

test('arithmetic substitution', t => {
	const result = bashParser('variable=$((42 + 43))');
	delete result.commands[0].prefix[0].expansion[0].arithmeticAST;
	t.deepEqual(result.commands[0].prefix[0], {
		text: 'variable=$((42 + 43))',
		type: 'assignment_word',
		expansion: [{
			expression: '42 + 43',
			kind: 'arithmetic',
			start: 9,
			end: 21
		}]
	});
});

test('arithmetic & parameter substitution', t => {
	const result = bashParser('variable=$((42 + 43)) $ciao');
	delete result.commands[0].prefix[0].expansion[1].arithmeticAST;
	// utils.logResults(result.commands[0].prefix[0]);
	t.deepEqual(result.commands[0].prefix[0], {
		text: 'variable=$((42 + 43)) $ciao',
		type: 'assignment_word',
		expansion: [{
			type: 'parameter_expansion',
			parameter: 'ciao',
			start: 22,
			end: 27
		}, {
			expression: '42 + 43',
			kind: 'arithmetic',
			start: 9,
			end: 21
		}]
	});
});

test('arithmetic substitution in suffix', t => {
	const result = bashParser('echo $((42 + 43))');
	delete result.commands[0].suffix[0].expansion[0].arithmeticAST;
	t.deepEqual(result.commands[0].suffix[0], {
		type: 'word',
		text: '$((42 + 43))',
		expansion: [{
			expression: '42 + 43',
			kind: 'arithmetic',
			start: 0,
			end: 12
		}]
	});
});

test('arithmetic substitution node applied to invalid expressions throws', async t => {
	const result = await t.throws(() => bashParser('echo $((a b c d))'));
	const message = result.message.split('\n')[0];
	t.is(message, 'SyntaxError: Cannot parse arithmetic expression "a b c d": Unexpected token (1:2)');
});

test('arithmetic substitution node applied to non expressions throws', async t => {
	const result = await t.throws(() => bashParser('echo $((while(1);))'));
	const message = result.message.split('\n')[0];
	t.is(message, 'SyntaxError: Cannot parse arithmetic expression "while(1);": Not an expression');
});

test('arithmetic ast is parsed', t => {
	const result = bashParser('variable=$((42 + 43))')
		.commands[0].prefix[0].expansion[0].arithmeticAST;
	// utils.logResults(result)
	t.deepEqual(result, {
		type: 'BinaryExpression',
		start: 0,
		end: 7,
		loc: {
			start: {
				line: 1,
				column: 0
			},
			end: {
				line: 1,
				column: 7
			}
		},
		left: {
			type: 'NumericLiteral',
			start: 0,
			end: 2,
			loc: {
				start: {
					line: 1,
					column: 0
				},
				end: {
					line: 1,
					column: 2
				}
			},
			extra: {
				rawValue: 42,
				raw: '42'
			},
			value: 42
		},
		operator: '+',
		right: {
			type: 'NumericLiteral',
			start: 5,
			end: 7,
			loc: {
				start: {
					line: 1,
					column: 5
				},
				end: {
					line: 1,
					column: 7
				}
			},
			extra: {
				rawValue: 43,
				raw: '43'
			},
			value: 43
		}
	});
});

