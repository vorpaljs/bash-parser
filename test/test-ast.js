'use strict';
/* eslint-disable camelcase */
const test = require('ava');
const bashParser = require('../src');
// const utils = require('./_utils');

test('command with one argument', t => {
	const result = bashParser('echo world');
	t.deepEqual(result, {
		type: 'complete_command',
		commands: [{
			type: 'simple_command',
			name: {type: 'word', text: 'echo'},
			suffix: [{type: 'word', text: 'world'}]
		}]
	});
});

test('command with pre-assignment', t => {
	const result = bashParser('TEST=1 run');
	t.deepEqual(result, {
		type: 'complete_command',
		commands: [{
			type: 'simple_command',
			name: {type: 'word', text: 'run'},
			prefix: [{type: 'assignment_word', text: 'TEST=1'}]
		}]
	});
});

test('commands with AND', t => {
	const result = bashParser('run && stop');
	// utils.logResults(result)
	t.deepEqual(result, {
		type: 'complete_command',
		commands: [{
			type: 'and_or',
			op: 'and',
			left: {type: 'simple_command', name: {type: 'word', text: 'run'}},
			right: {type: 'simple_command', name: {type: 'word', text: 'stop'}}
		}]
	});
});

test('commands with AND \\n', t => {
	const result = bashParser('run && \n stop');
	// console.log(inspect(result, {depth: null}))
	t.deepEqual(result, {
		type: 'complete_command',
		commands: [{
			type: 'and_or',
			op: 'and',
			left: {type: 'simple_command', name: {type: 'word', text: 'run'}},
			right: {type: 'simple_command', name: {type: 'word', text: 'stop'}}
		}]
	});
});

test('commands with OR', t => {
	const result = bashParser('run || cry');
	t.deepEqual(result, {
		type: 'complete_command',
		commands: [{
			type: 'and_or',
			op: 'or',
			left: {type: 'simple_command', name: {type: 'word', text: 'run'}},
			right: {type: 'simple_command', name: {type: 'word', text: 'cry'}}
		}]
	});
});

test('pipelines', t => {
	const result = bashParser('run | cry');
	// console.log(inspect(result, {depth: null}));
	t.deepEqual(result, {
		type: 'complete_command',
		commands: [{
			type: 'pipeline',
			commands: [
				{type: 'simple_command', name: {type: 'word', text: 'run'}},
				{type: 'simple_command', name: {type: 'word', text: 'cry'}}
			]
		}]
	});
});

test('no pre-assignment on suffix', t => {
	const result = bashParser('echo TEST=1');
	t.deepEqual(result, {
		type: 'complete_command',
		commands: [{
			type: 'simple_command',
			name: {type: 'word', text: 'echo'},
			suffix: [{type: 'word', text: 'TEST=1'}]
		}]
	});
});

test('command with multiple prefixes', t => {
	const result = bashParser('TEST1=1 TEST2=2 echo world');
	t.deepEqual(result, {
		type: 'complete_command',
		commands: [{
			type: 'simple_command',
			name: {type: 'word', text: 'echo'},
			prefix: [
				{type: 'assignment_word', text: 'TEST1=1'},
				{type: 'assignment_word', text: 'TEST2=2'}
			],
			suffix: [{type: 'word', text: 'world'}]
		}]
	});
});

test('multi line commands', t => {
	const result = bashParser('echo; \nls;\n');
	t.deepEqual(result, {
		type: 'complete_command',
		commands: [{
			type: 'simple_command',
			name: {type: 'word', text: 'echo'}
		}, {
			type: 'simple_command',
			name: {type: 'word', text: 'ls'}
		}]
	});
});

test('command with redirection to file', t => {
	const result = bashParser('ls > file.txt');
	t.deepEqual(result, {
		type: 'complete_command',
		commands: [{
			type: 'simple_command',
			name: {type: 'word', text: 'ls'},
			suffix: [{
				type: 'io_redirect',
				op: {text: '>'},
				file: {type: 'word', text: 'file.txt'}
			}]
		}]
	});
});

test('parse multiple suffix', t => {
	const result = bashParser('command foo --lol');
	t.deepEqual(
		result, {
			type: 'complete_command',
			commands: [{
				type: 'simple_command',
				name: {type: 'word', text: 'command'},
				suffix: [{type: 'word', text: 'foo'}, {type: 'word', text: '--lol'}]
			}]
		}
	);
});

test('command with stderr redirection to file', t => {
	const result = bashParser('ls 2> file.txt');
	t.deepEqual(result, {
		type: 'complete_command',
		commands: [{
			type: 'simple_command',
			name: {type: 'word', text: 'ls'},
			suffix: [{
				type: 'io_redirect',
				op: {text: '>'},
				file: {type: 'word', text: 'file.txt'},
				numberIo: {text: '2'}
			}]
		}]
	});
});

test('parse subshell', t => {
	const result = bashParser('( ls )');
	t.deepEqual(result, {
		type: 'complete_command',
		commands: [{
			type: 'subshell',
			list: {
				type: 'compound_list',
				commands: [{type: 'simple_command', name: {type: 'word', text: 'ls'}}]
			}
		}]
	});
});
