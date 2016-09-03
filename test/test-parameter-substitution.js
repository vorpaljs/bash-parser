'use strict';
const test = require('ava');
const bashParser = require('../src');
const utils = require('./_utils');

/* eslint-disable camelcase */
test('parameter substitution in assignment', t => {
	const result = bashParser('echoword=${other}test');
	t.deepEqual(result.commands[0].prefix, [{
		type: 'assignment_word',
		text: 'echoword=${other}test',
		expansion: [{
			type: 'parameter_expansion',
			parameter: 'other',
			start: 9,
			end: 17
		}]
	}]);
});

test('parameter substitution and other words', t => {
	const result = bashParser('foo ${other} bar baz');
	// utils.logResults(result);
	t.deepEqual(result.commands[0], {
		type: 'simple_command',
		name: {
			text: 'foo',
			type: 'word'
		},
		suffix: [{
			text: '${other}',
			expansion: [{
				parameter: 'other',
				start: 0,
				end: 8,
				type: 'parameter_expansion'
			}],
			type: 'word'
		}, {
			text: 'bar',
			type: 'word'
		}, {
			text: 'baz',
			type: 'word'
		}]
	});
});

test('multi-word parameter substitution', t => {
	const result = bashParser('echoword=${other word}test');
	t.deepEqual(result.commands[0].prefix, [{
		type: 'assignment_word',
		text: 'echoword=${other word}test',
		expansion: [{
			type: 'parameter_expansion',
			parameter: 'other word',
			start: 9,
			end: 22
		}]
	}]);
});

test('parameter substitution', t => {
	const result = bashParser('echo word${other}test');
	t.deepEqual(result.commands[0].suffix, [{
		type: 'word',
		text: 'word${other}test',
		expansion: [{
			type: 'parameter_expansion',
			parameter: 'other',
			start: 4,
			end: 12
		}]
	}]);
});

test('multiple parameter substitution', t => {
	const result = bashParser('echo word${other}t$est');
	t.deepEqual(result.commands[0].suffix, [{
		type: 'word',
		text: 'word${other}t$est',
		expansion: [{
			type: 'parameter_expansion',
			parameter: 'other',
			start: 4,
			end: 12
		},
		{
			type: 'parameter_expansion',
			parameter: 'est',
			start: 13,
			end: 17
		}]
	}]);
});

test('command consisting of only parameter substitution', t => {
	const result = bashParser('$other');
	t.deepEqual(result.commands[0].name, {
		type: 'word',
		text: '$other',
		expansion: [{
			type: 'parameter_expansion',
			parameter: 'other',
			start: 0,
			end: 6
		}]
	});
});

test('invalid name paramter substitution', t => {
	const result = bashParser('$(other');
	// console.log(JSON.stringify(result, null, 5))

	t.deepEqual(result.commands[0].name, {
		type: 'word',
		text: '$(other'
	});
});

test('parameter with use default value', t => {
	const result = bashParser('${other:-default_value}');
	// console.log(JSON.stringify(result, null, 5))
	t.deepEqual(result.commands[0].name, {
		type: 'word',
		text: '${other:-default_value}',
		expansion: [{
			type: 'parameter_expansion',
			parameter: 'other',
			word: {
				text: 'default_value'
			},
			op: 'useDefaultValue',
			start: 0,
			end: 23
		}]
	});
});

test('parameter with assign default value', t => {
	const result = bashParser('${other:=default_value}');
	t.deepEqual(result.commands[0].name, {
		type: 'word',
		text: '${other:=default_value}',
		expansion: [{
			type: 'parameter_expansion',
			parameter: 'other',
			word: {
				text: 'default_value'
			},
			op: 'assignDefaultValue',
			start: 0,
			end: 23
		}]
	});
});

test('parameter with other parameter in word', t => {
	const result = bashParser('${other:=default$value}');
	// utils.logResults(result);
	t.deepEqual(result.commands[0].name, {
		type: 'word',
		text: '${other:=default$value}',
		expansion: [{
			type: 'parameter_expansion',
			parameter: 'other',
			word: {
				text: 'default$value',
				expansion: [{
					type: 'parameter_expansion',
					parameter: 'value',
					start: 7,
					end: 13
				}]
			},
			op: 'assignDefaultValue',
			start: 0,
			end: 23
		}]
	});
});

test('parameter with indicate error if null', t => {
	const result = bashParser('${other:?default_value}');
	t.deepEqual(result.commands[0].name, {
		text: '${other:?default_value}',
		type: 'word',
		expansion: [{
			type: 'parameter_expansion',
			parameter: 'other',
			word: {
				text: 'default_value'
			},
			op: 'indicateErrorIfNull',
			start: 0,
			end: 23
		}]
	});
});

test('parameter with use alternative value', t => {
	const result = bashParser('${other:+default_value}');
	t.deepEqual(result.commands[0].name, {
		text: '${other:+default_value}',
		type: 'word',
		expansion: [{
			type: 'parameter_expansion',
			parameter: 'other',
			word: {
				text: 'default_value'
			},
			op: 'useAlternativeValue',
			start: 0,
			end: 23
		}]
	});
});

test('resolve parameter', t => {
	const result = bashParser('"foo ${other} baz"', {
		resolveParameter() {
			return 'bar';
		}
	});
	// utils.logResults(result.commands[0]);
	t.deepEqual(result.commands[0], {
		type: 'simple_command',
		name: {
			text: '"foo bar baz"',
			originalText: '"foo ${other} baz"',
			expansion: [
				{
					parameter: 'other',
					start: 5,
					end: 13,
					resolved: true,
					type: 'parameter_expansion'
				}
			],
			type: 'word'
		}
	});
});

test('resolve double parameter', t => {
	const result = bashParser('"foo ${other} ${one} baz"', {
		resolveParameter() {
			return 'bar';
		}
	});
	t.deepEqual(result.commands[0], {
		type: 'simple_command',
		name: {
			text: '"foo bar bar baz"',
			originalText: '"foo ${other} ${one} baz"',
			expansion: [{
				parameter: 'other',
				start: 5,
				end: 13,
				resolved: true,
				type: 'parameter_expansion'
			}, {
				parameter: 'one',
				start: 14,
				end: 20,
				resolved: true,
				type: 'parameter_expansion'
			}],
			type: 'word'
		}
	});
});
/*
test('field splitting', t => {
	const result = bashParser('say ${other} plz', {
		resolveParameter() {
			return 'foo\tbar baz';
		},

		resolveEnv() {
			return '\t ';
		}
	});
	utils.logResults(result)
	t.deepEqual(result.commands[0], {
		type: 'simple_command',
		name: {
			text: 'say',
			type: 'word'
		},
		suffix: [{
			type: 'word',
			text: 'foo'
		}, {
			type: 'word',
			text: 'bar'
		}, {
			type: 'word',
			text: 'baz'
		}, {
			type: 'word',
			text: 'plz'
		}]
	});
});

*/
