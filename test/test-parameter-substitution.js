'use strict';
import 'babel-register';

const test = require('ava');
const bashParser = require('../src');
const utils = require('./_utils');

/* eslint-disable camelcase */
test('parameter substitution in assignment', t => {
	const result = bashParser('echoword=${other}test');
	// utils.logResults(result);
	utils.checkResults(t, result.commands[0].prefix, [{
		type: 'assignment_word',
		text: 'echoword=${other}test',
		expansion: [{
			type: 'parameter_expansion',
			parameter: 'other',
			loc: {
				start: 9,
				end: 16
			}
		}]
	}]);
});

test('parameter substitution skip escaped dollar', t => {
	const result = bashParser('echo "\\$ciao"');
	utils.checkResults(t, result.commands[0].suffix, [{type: 'word', text: '\\$ciao'}]);
});

test('parameter substitution skip escaped dollar with braces', t => {
	const result = bashParser('echo "\\${ciao}"');
	utils.checkResults(t, result.commands[0].suffix, [{type: 'word', text: '\\${ciao}'}]);
});

test('parameter substitution skip single quoted words', t => {
	const result = bashParser('echo \'${echo } $ciao\'');
	// utils.logResults(result)
	utils.checkResults(t, result.commands[0].suffix, [{
		type: 'word',
		text: '${echo } $ciao'
	}]);
});

test('parameter substitution and other words', t => {
	const result = bashParser('foo ${other} bar baz');
	// utils.logResults(result);
	utils.checkResults(t, result.commands[0].suffix, [{
		text: '${other}',
		expansion: [{
			parameter: 'other',
			loc: {
				start: 0,
				end: 7
			},
			type: 'parameter_expansion'
		}],
		type: 'word'
	}, {
		text: 'bar',
		type: 'word'
	}, {
		text: 'baz',
		type: 'word'
	}]);
});

test('multi-word parameter substitution', t => {
	const result = bashParser('echoword=${other word}test');
	// utils.logResults(result);

	utils.checkResults(t, result.commands[0].prefix, [{
		type: 'assignment_word',
		text: 'echoword=${other word}test',
		expansion: [{
			type: 'parameter_expansion',
			parameter: 'other word',
			loc: {
				start: 9,
				end: 21
			}
		}]
	}]);
});

test('parameter substitution', t => {
	const result = bashParser('echo word${other}test');
	utils.checkResults(t, result.commands[0].suffix, [{
		type: 'word',
		text: 'word${other}test',
		expansion: [{
			type: 'parameter_expansion',
			parameter: 'other',
			loc: {
				start: 4,
				end: 11
			}
		}]
	}]);
});

test('multiple parameter substitution', t => {
	const result = bashParser('echo word${other}t$est');
	utils.checkResults(t, result.commands[0].suffix, [{
		type: 'word',
		text: 'word${other}t$est',
		expansion: [{
			type: 'parameter_expansion',
			parameter: 'other',
			loc: {
				start: 4,
				end: 11
			}
		},
		{
			type: 'parameter_expansion',
			parameter: 'est',
			loc: {
				start: 13,
				end: 16
			}
		}]
	}]);
});

test('command consisting of only parameter substitution', t => {
	const result = bashParser('$other');
	// utils.logResults(result)
	utils.checkResults(t, result.commands[0].name, {
		type: 'word',
		text: '$other',
		expansion: [{
			type: 'parameter_expansion',
			parameter: 'other',
			loc: {
				start: 0,
				end: 5
			}
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
	utils.checkResults(t, result.commands[0], {
		type: 'simple_command',
		name: {
			text: 'foo bar baz',
			originalText: '"foo ${other} baz"',
			expansion: [
				{
					parameter: 'other',
					loc: {
						start: 5,
						end: 12
					},
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
	// utils.logResults(result);
	utils.checkResults(t, result.commands[0], {
		type: 'simple_command',
		name: {
			text: 'foo bar bar baz',
			originalText: '"foo ${other} ${one} baz"',
			expansion: [{
				parameter: 'other',
				loc: {
					start: 5,
					end: 12
				},
				resolved: true,
				type: 'parameter_expansion'
			}, {
				parameter: 'one',
				loc: {
					start: 14,
					end: 19
				},
				resolved: true,
				type: 'parameter_expansion'
			}],
			type: 'word'
		}
	});
});

test.skip('field splitting', t => {
	const result = bashParser('say ${other} plz', {
		resolveParameter() {
			return 'foo\tbar baz';
		},

		resolveEnv() {
			return '\t ';
		}
	});
	// utils.logResults(result)
	utils.checkResults(t, result.commands[0], {
		type: 'simple_command',
		name: {
			text: 'say',
			type: 'word'
		},
		suffix: [{
			text: 'foo',
			expansion: [{
				parameter: 'other',
				start: 0,
				end: 8,
				type: 'parameter_expansion',
				resolved: true
			}],
			originalText: '${other}',
			type: 'word',
			joined: 'foo\u0000bar\u0000baz',
			fieldIdx: 0
		}, {
			text: 'bar',
			expansion: [{
				parameter: 'other',
				start: 0,
				end: 8,
				type: 'parameter_expansion',
				resolved: true
			}],
			originalText: '${other}',
			type: 'word',
			joined: 'foo\u0000bar\u0000baz',
			fieldIdx: 1
		}, {
			text: 'baz',
			expansion: [{
				parameter: 'other',
				start: 0,
				end: 8,
				type: 'parameter_expansion',
				resolved: true
			}],
			originalText: '${other}',
			type: 'word',
			joined: 'foo\u0000bar\u0000baz',
			fieldIdx: 2
		}, {
			text: 'plz',
			type: 'word'
		}]
	});
});

test.skip('field splitting not occurring within quoted words', t => {
	const result = bashParser('say "${other} plz"', {
		resolveParameter() {
			return 'foo\tbar baz';
		},

		resolveEnv() {
			return '\t ';
		}
	});
	// utils.logResults(result)
	utils.checkResults(t, result.commands[0], {
		type: 'simple_command',
		name: {
			text: 'say',
			type: 'word'
		},
		suffix: [{
			text: 'foo\tbar baz plz',
			expansion: [{
				parameter: 'other',
				start: 1,
				end: 9,
				type: 'parameter_expansion',
				resolved: true
			}],
			originalText: '"${other} plz"',
			type: 'word'
		}]
	});
});
