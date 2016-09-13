'use strict';
const test = require('ava');
const bashParser = require('../src');
// const utils = require('./_utils');

/* eslint-disable camelcase */
test('command substitution', t => {
	const result = bashParser('variable=$(echo ciao)');
	// utils.logResults(result)
	delete result.commands[0].prefix[0].expansion[0].commandAST;
	t.deepEqual(result.commands[0].prefix, [{
		type: 'assignment_word',
		text: 'variable=$(echo ciao)',
		expansion: [{
			command: 'echo ciao',
			type: 'command_expansion',
			start: 9,
			end: 21
		}]
	}]);
});

test('command substitution skip single quoted words', t => {
	const result = bashParser('echo \'$(echo ciao)\'');
	// utils.logResults(result)
	t.deepEqual(result.commands[0].suffix, [{
		type: 'word',
		text: '$(echo ciao)'
	}]);
});

test('command substitution with backticks skip single quoted words', t => {
	const result = bashParser('echo \'`echo ciao`\'');
	// utils.logResults(result)
	t.deepEqual(result.commands[0].suffix, [{
		type: 'word',
		text: '`echo ciao`'
	}]);
});

test('command substitution in suffix', t => {
	const result = bashParser('echo $(ciao)');
	delete result.commands[0].suffix[0].expansion[0].commandAST;
	t.deepEqual(result.commands[0].suffix, [{
		type: 'word',
		text: '$(ciao)',
		expansion: [{
			command: 'ciao',
			type: 'command_expansion',
			start: 0,
			end: 7
		}]
	}]);
});

test('command substitution in suffix with backticks', t => {
	const result = bashParser('echo `ciao`');
	delete result.commands[0].suffix[0].expansion[0].commandAST;

	t.deepEqual(result.commands[0].suffix, [{
		type: 'word',
		text: '`ciao`',
		expansion: [{
			command: 'ciao',
			type: 'command_expansion',
			start: 0,
			end: 6
		}]
	}]);
});

test('command ast is recursively parsed', t => {
	const result = bashParser('variable=$(echo ciao)')
		.commands[0].prefix[0].expansion[0].commandAST;

	t.deepEqual(result, {
		type: 'complete_command',
		commands: [{
			type: 'simple_command',
			name: {type: 'word', text: 'echo'},
			suffix: [{type: 'word', text: 'ciao'}]
		}]
	});
});

test('command substitution with backticks', t => {
	const result = bashParser('variable=`echo ciao`');
	delete result.commands[0].prefix[0].expansion[0].commandAST;

	t.deepEqual(result.commands[0].prefix, [{
		type: 'assignment_word',
		text: 'variable=`echo ciao`',
		expansion: [{
			command: 'echo ciao',
			type: 'command_expansion',
			start: 9,
			end: 20
		}]
	}]);
});

test('quoted backtick are removed within command substitution with backticks', t => {
	const result = bashParser('variable=`echo \\`echo ciao\\``');
	delete result.commands[0].prefix[0].expansion[0].commandAST;
	// utils.logResults(result);

	t.deepEqual(result.commands[0].prefix, [{
		type: 'assignment_word',
		text: 'variable=`echo \\`echo ciao\\``',
		expansion: [{
			command: 'echo `echo ciao`',
			type: 'command_expansion',
			start: 9,
			end: 29
		}]
	}]);
});

test('quoted backtick are not removed within command substitution with parenthesis', t => {
	const result = bashParser('variable=$(echo \\`echo ciao\\`)');
	delete result.commands[0].prefix[0].expansion[0].commandAST;
	t.deepEqual(result.commands[0].prefix, [{
		type: 'assignment_word',
		text: 'variable=$(echo \\`echo ciao\\`)',
		expansion: [{
			command: 'echo \\`echo ciao\\`',
			type: 'command_expansion',
			start: 9,
			end: 30
		}]
	}]);
});

test('resolve double command', t => {
	const result = bashParser('"foo $(other) $(one) baz"', {
		execCommand() {
			return 'bar';
		}
	});
	delete result.commands[0].name.expansion[0].commandAST;
	delete result.commands[0].name.expansion[1].commandAST;

	// utils.logResults(result.commands[0]);
	t.deepEqual(result.commands[0], {
		type: 'simple_command',
		name: {
			text: 'foo bar bar baz',
			originalText: '"foo $(other) $(one) baz"',
			expansion: [{
				command: 'other',
				start: 5,
				end: 13,
				resolved: true,
				type: 'command_expansion'
			}, {
				command: 'one',
				start: 14,
				end: 20,
				resolved: true,
				type: 'command_expansion'
			}],
			type: 'word'
		}
	});
});

test('resolve double command with backticks', t => {
	const result = bashParser('"foo `other` `one` baz"', {
		execCommand() {
			return 'bar';
		}
	});
	delete result.commands[0].name.expansion[0].commandAST;
	delete result.commands[0].name.expansion[1].commandAST;

	// utils.logResults(result.commands[0]);
	t.deepEqual(result.commands[0], {
		type: 'simple_command',
		name: {
			text: 'foo bar bar baz',
			originalText: '"foo `other` `one` baz"',
			expansion: [{
				command: 'other',
				start: 5,
				end: 12,
				resolved: true,
				type: 'command_expansion'
			}, {
				command: 'one',
				start: 13,
				end: 18,
				resolved: true,
				type: 'command_expansion'
			}],
			type: 'word'
		}
	});
});

test('last newlines are removed from command output', t => {
	const result = bashParser('"foo $(other) baz"', {
		execCommand() {
			return 'bar\n\n';
		}
	});
	delete result.commands[0].name.expansion[0].commandAST;
	// utils.logResults(result)
	t.deepEqual(result.commands[0], {
		type: 'simple_command',
		name: {
			text: 'foo bar baz',
			originalText: '"foo $(other) baz"',
			expansion: [{
				command: 'other',
				start: 5,
				end: 13,
				resolved: true,
				type: 'command_expansion'
			}],
			type: 'word'
		}
	});
});

test('field splitting', t => {
	const result = bashParser('say $(other) plz', {
		execCommand() {
			return 'foo\tbar baz';
		},

		resolveEnv() {
			return '\t ';
		}
	});

	delete result.commands[0].suffix[0].expansion[0].commandAST;
	delete result.commands[0].suffix[1].expansion[0].commandAST;
	delete result.commands[0].suffix[2].expansion[0].commandAST;

	t.deepEqual(result.commands[0], {
		type: 'simple_command',
		name: {
			text: 'say',
			type: 'word'
		},
		suffix: [{
			text: 'foo',
			expansion: [{
				command: 'other',
				start: 0,
				end: 8,
				type: 'command_expansion',
				resolved: true
			}],
			originalText: '$(other)',
			type: 'word',
			joined: 'foo\u0000bar\u0000baz',
			fieldIdx: 0
		}, {
			text: 'bar',
			expansion: [{
				command: 'other',
				start: 0,
				end: 8,
				type: 'command_expansion',
				resolved: true
			}],
			originalText: '$(other)',
			type: 'word',
			joined: 'foo\u0000bar\u0000baz',
			fieldIdx: 1
		}, {
			text: 'baz',
			expansion: [{
				command: 'other',
				start: 0,
				end: 8,
				type: 'command_expansion',
				resolved: true
			}],
			originalText: '$(other)',
			type: 'word',
			joined: 'foo\u0000bar\u0000baz',
			fieldIdx: 2
		}, {
			text: 'plz',
			type: 'word'
		}]
	});
});

