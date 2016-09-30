'use strict';
/* eslint-disable camelcase */

const test = require('ava');
const bashParser = require('../src');
const utils = require('./_utils');

test('command with one argument', t => {
	const result = bashParser('echo world');
	// utils.logResults(result)
	utils.checkResults(t, result, {
		type: 'Script',
		commands: [{
			type: 'Command',
			name: {type: 'Word', text: 'echo'},
			suffix: [{type: 'Word', text: 'world'}]
		}]
	});
});

test('command with multiple new lines', t => {
	const result = bashParser('\n\n\necho world');
	utils.checkResults(t, result, {
		type: 'Script',
		commands: [{
			type: 'Command',
			name: {type: 'Word', text: 'echo'},
			suffix: [{type: 'Word', text: 'world'}]
		}]
	});
});

test('command with multiple lines continuation', t => {
	const result = bashParser('echo \\\n\\\n\\\n\\\nthere');
	// utils.logResults(result);
	utils.checkResults(t, result.commands[0].suffix[0], {
		text: 'there',
		type: 'Word'
	});
});

test('command with pre-assignment', t => {
	const result = bashParser('TEST=1 run');
	utils.checkResults(t, result, {
		type: 'Script',
		commands: [{
			type: 'Command',
			name: {type: 'Word', text: 'run'},
			prefix: [{type: 'AssignmentWord', text: 'TEST=1'}]
		}]
	});
});

test('commands with AND', t => {
	const result = bashParser('run && stop');
	// utils.logResults(result)
	utils.checkResults(t, result, {
		type: 'Script',
		commands: [{
			type: 'LogicalExpression',
			op: 'and',
			left: {type: 'Command', name: {type: 'Word', text: 'run'}},
			right: {type: 'Command', name: {type: 'Word', text: 'stop'}}
		}]
	});
});

test('commands with AND \\n', t => {
	const result = bashParser('run && \n stop');
	// console.log(inspect(result, {depth: null}))
	utils.checkResults(t, result, {
		type: 'Script',
		commands: [{
			type: 'LogicalExpression',
			op: 'and',
			left: {type: 'Command', name: {type: 'Word', text: 'run'}},
			right: {type: 'Command', name: {type: 'Word', text: 'stop'}}
		}]
	});
});

test('commands with OR', t => {
	const result = bashParser('run || cry');
	utils.checkResults(t, result, {
		type: 'Script',
		commands: [{
			type: 'LogicalExpression',
			op: 'or',
			left: {type: 'Command', name: {type: 'Word', text: 'run'}},
			right: {type: 'Command', name: {type: 'Word', text: 'cry'}}
		}]
	});
});

test('pipelines', t => {
	const result = bashParser('run | cry');
	// console.log(inspect(result, {depth: null}));
	utils.checkResults(t, result, {
		type: 'Script',
		commands: [{
			type: 'Pipeline',
			commands: [
				{type: 'Command', name: {type: 'Word', text: 'run'}},
				{type: 'Command', name: {type: 'Word', text: 'cry'}}
			]
		}]
	});
});

test('bang pipelines', t => {
	const result = bashParser('! run | cry');
	utils.checkResults(t, result, {
		type: 'Script',
		commands: [{
			type: 'Pipeline',
			bang: true,
			commands: [
				{type: 'Command', name: {type: 'Word', text: 'run'}},
				{type: 'Command', name: {type: 'Word', text: 'cry'}}
			]
		}]
	});
});

test('no pre-assignment on suffix', t => {
	const result = bashParser('echo TEST=1');
	utils.checkResults(t, result, {
		type: 'Script',
		commands: [{
			type: 'Command',
			name: {type: 'Word', text: 'echo'},
			suffix: [{type: 'Word', text: 'TEST=1'}]
		}]
	});
});

test('command with multiple prefixes', t => {
	const result = bashParser('TEST1=1 TEST2=2 echo world');
	// utils.logResults(result)
	utils.checkResults(t, result, {
		type: 'Script',
		commands: [{
			type: 'Command',
			name: {type: 'Word', text: 'echo'},
			prefix: [
				{type: 'AssignmentWord', text: 'TEST1=1'},
				{type: 'AssignmentWord', text: 'TEST2=2'}
			],
			suffix: [{type: 'Word', text: 'world'}]
		}]
	});
});

test('multi line commands', t => {
	const result = bashParser('echo; \nls;\n');
	utils.checkResults(t, result, {
		type: 'Script',
		commands: [{
			type: 'Command',
			name: {type: 'Word', text: 'echo'}
		}, {
			type: 'Command',
			name: {type: 'Word', text: 'ls'}
		}]
	});
});

test('command with redirection to file', t => {
	const result = bashParser('ls > file.txt');
	utils.checkResults(t, result, {
		type: 'Script',
		commands: [{
			type: 'Command',
			name: {type: 'Word', text: 'ls'},
			suffix: [{
				type: 'Redirect',
				op: {type: 'great', text: '>'},
				file: {type: 'Word', text: 'file.txt'}
			}]
		}]
	});
});

test('parse multiple suffix', t => {
	const result = bashParser('command foo --lol');
	utils.checkResults(t,
		result, {
			type: 'Script',
			commands: [{
				type: 'Command',
				name: {type: 'Word', text: 'command'},
				suffix: [{type: 'Word', text: 'foo'}, {type: 'Word', text: '--lol'}]
			}]
		}
	);
});

test('command with stderr redirection to file', t => {
	const result = bashParser('ls 2> file.txt');
	// utils.logResults(result);
	utils.checkResults(t, result, {
		type: 'Script',
		commands: [{
			type: 'Command',
			name: {type: 'Word', text: 'ls'},
			suffix: [{
				type: 'Redirect',
				op: {type: 'great', text: '>'},
				file: {type: 'Word', text: 'file.txt'},
				numberIo: {type: 'io_number', text: '2'}
			}]
		}]
	});
});

test('parse subshell', t => {
	const result = bashParser('( ls )');

	utils.checkResults(t, result, {
		type: 'Script',
		commands: [{
			type: 'Subshell',
			list: {
				type: 'CompoundList',
				commands: [{type: 'Command', name: {type: 'Word', text: 'ls'}}]
			}
		}]
	});
});
