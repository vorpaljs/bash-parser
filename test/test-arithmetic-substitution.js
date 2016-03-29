'use strict';
const test = require('ava');
const bashParser = require('../src');
// const utils = require('./_utils');

/* eslint-disable camelcase */

test('arithmetic substitution', t => {
	const result = bashParser('variable=$((42 + 43))');
	delete result.commands[0].prefix.list[0].expansion[0].arithmeticAST;
	t.deepEqual(result.commands[0].prefix.list[0], {
		text: 'variable=$((42 + 43))',
		expansion: [{
			expression: '42 + 43',
			kind: 'arithmetic',
			start: 9,
			end: 21
		}]
	});
});

test('arithmetic substitution in suffix', t => {
	const result = bashParser('echo $((42 + 43))');
	delete result.commands[0].suffix.list[0].expansion[0].arithmeticAST;
	t.deepEqual(result.commands[0].suffix.list[0], {
		text: '$((42 + 43))',
		expansion: [{
			expression: '42 + 43',
			kind: 'arithmetic',
			start: 0,
			end: 12
		}]
	});
});

test('arithmetic ast is parsed', t => {
	const result = bashParser('variable=$((42 + 43))')
		.commands[0].prefix.list[0].expansion[0].arithmeticAST;
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

