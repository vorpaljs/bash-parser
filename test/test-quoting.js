'use strict';
const test = require('ava');
const bashParser = require('../src');
// const utils = require('./_utils');

test('quotes within double quotes', t => {
	const result = bashParser('echo "TEST1 \'TEST2"');
	// utils.logResults(result)
	t.deepEqual(result, {
		type: 'complete_command',
		commands: [{
			type: 'simple_command',
			name: {type: 'word', text: 'echo'},
			suffix: [{type: 'word', text: 'TEST1 \'TEST2'}]
		}]
	});
});

test('escaped double quotes within double quotes', t => {
	const result = bashParser('echo "TEST1 \\"TEST2"');
	// utils.logResults(result);
	t.deepEqual(result, {
		type: 'complete_command',
		commands: [{
			type: 'simple_command',
			name: {type: 'word', text: 'echo'},
			suffix: [{type: 'word', text: 'TEST1 "TEST2'}]
		}]
	});
});

test('double quotes within single quotes', t => {
	const result = bashParser('echo \'TEST1 "TEST2\'');
	t.deepEqual(result, {
		type: 'complete_command',
		commands: [{
			type: 'simple_command',
			name: {type: 'word', text: 'echo'},
			suffix: [{type: 'word', text: 'TEST1 "TEST2'}]
		}]
	});
});

test('Partially quoted word', t => {
	const result = bashParser('echo TEST1\' TEST2 \'TEST3');
	t.deepEqual(result, {
		type: 'complete_command',
		commands: [{
			type: 'simple_command',
			name: {type: 'word', text: 'echo'},
			suffix: [{type: 'word', text: 'TEST1 TEST2 TEST3'}]
		}]
	});
});

test('Partially double quoted word', t => {
	const result = bashParser('echo TEST3" TEST4 "TEST5');
	// utils.logResults(result);
	t.deepEqual(result, {
		type: 'complete_command',
		commands: [{
			type: 'simple_command',
			name: {type: 'word', text: 'echo'},
			suffix: [{type: 'word', text: 'TEST3 TEST4 TEST5'}]
		}]
	});
});
