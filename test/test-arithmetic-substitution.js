'use strict';
const test = require('ava');
const bashParser = require('../src');
// const utils = require('./_utils');

test('arithmetic substitution', t => {
	const result = bashParser('variable=$((42 + 43))');
	delete result.commands[0].prefix[0].expansion[0].arithmeticAST;
	t.deepEqual(result.commands[0].prefix[0], {
		text: 'variable=$((42 + 43))',
		type: 'assignment_word',
		expansion: [{
			expression: '42 + 43',
			type: 'arithmetic_expansion',
			start: 9,
			end: 21
		}]
	});
});

test('arithmetic substitution skip single quoted words', t => {
	const result = bashParser('echo \'$((42 * 42))\'');
	// utils.logResults(result)
	t.deepEqual(result.commands[0].suffix, [{
		type: 'word',
		text: '$((42 * 42))'
	}]);
});

test('arithmetic substitution skip escaped dollar', t => {
	const result = bashParser('echo "\\$(\\(42 * 42))"');
	// utils.logResults(result)
	t.deepEqual(result.commands[0].suffix, [{
		type: 'word',
		text: '\\$(\\(42 * 42))'
	}]);
});

test('arithmetic & parameter substitution', t => {
	const result = bashParser('variable=$((42 + 43)) $ciao');
	// utils.logResults(result.commands[0]);
	delete result.commands[0].prefix[0].expansion[0].arithmeticAST;
	t.deepEqual(result.commands[0].prefix[0], {
		text: 'variable=$((42 + 43))',
		type: 'assignment_word',
		expansion: [{
			expression: '42 + 43',
			type: 'arithmetic_expansion',
			start: 9,
			end: 21
		}]
	});

	t.deepEqual(result.commands[0].name, {
		text: '$ciao',
		type: 'word',
		expansion: [{
			type: 'parameter_expansion',
			parameter: 'ciao',
			start: 0,
			end: 5
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
			type: 'arithmetic_expansion',
			start: 0,
			end: 12
		}]
	});
});

test('arithmetic substitution node applied to invalid expressions throws', async t => {
	const result = await t.throws(() => bashParser('echo $((a b c d))'));
	const message = result.message.split('\n')[0];
	t.is(message, 'Cannot parse arithmetic expression "a b c d": Unexpected token (1:2)');
});

test('arithmetic substitution node applied to non expressions throws', async t => {
	const result = await t.throws(() => bashParser('echo $((while(1);))'));
	const message = result.message.split('\n')[0];
	t.is(message, 'Cannot parse arithmetic expression "while(1);": Not an expression');
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

test('resolve expression', t => {
	const result = bashParser('"foo $((42 * 42)) baz"', {
		runArithmeticExpression() {
			return '43';
		}
	});
	delete result.commands[0].name.expansion[0].arithmeticAST;

	// utils.logResults(result.commands[0]);
	t.deepEqual(result.commands[0], {
		type: 'simple_command',
		name: {
			text: 'foo 43 baz',
			originalText: '"foo $((42 * 42)) baz"',
			expansion: [{
				expression: '42 * 42',
				start: 5,
				end: 17,
				resolved: true,
				type: 'arithmetic_expansion'
			}],
			type: 'word'
		}
	});
});

test('field splitting', t => {
	const result = bashParser('say $((other)) plz', {
		runArithmeticExpression() {
			return 'foo\tbar baz';
		},

		resolveEnv() {
			return '\t ';
		}
	});

	delete result.commands[0].suffix[0].expansion[0].arithmeticAST;
	delete result.commands[0].suffix[1].expansion[0].arithmeticAST;
	delete result.commands[0].suffix[2].expansion[0].arithmeticAST;

//	utils.logResults(result)

	t.deepEqual(result.commands[0], {
		type: 'simple_command',
		name: {
			text: 'say',
			type: 'word'
		},
		suffix: [{
			text: 'foo',
			expansion: [{
				expression: 'other',
				start: 0,
				end: 10,
				type: 'arithmetic_expansion',
				resolved: true
			}],
			originalText: '$((other))',
			type: 'word',
			joined: 'foo\u0000bar\u0000baz',
			fieldIdx: 0
		}, {
			text: 'bar',
			expansion: [{
				expression: 'other',
				start: 0,
				end: 10,
				type: 'arithmetic_expansion',
				resolved: true
			}],
			originalText: '$((other))',
			type: 'word',
			joined: 'foo\u0000bar\u0000baz',
			fieldIdx: 1
		}, {
			text: 'baz',
			expansion: [{
				expression: 'other',
				start: 0,
				end: 10,
				type: 'arithmetic_expansion',
				resolved: true
			}],
			originalText: '$((other))',
			type: 'word',
			joined: 'foo\u0000bar\u0000baz',
			fieldIdx: 2
		}, {
			text: 'plz',
			type: 'word'
		}]
	});
});

