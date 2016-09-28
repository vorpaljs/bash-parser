'use strict';
require('babel-register');

const test = require('ava');
const bashParser = require('../src');
const utils = require('./_utils');

function testUnclosed(cmd, char) {
	return t => {
		const err = t.throws(() => bashParser(cmd));
		t.truthy(err instanceof SyntaxError);
		t.is(err.message, 'Unclosed ' + char);
	};
}

test('throws on unclosed double quotes', testUnclosed('echo "TEST1', '"'));
test('throws on unclosed single quotes', testUnclosed('echo \'TEST1', '\''));
test('throws on unclosed command subst', testUnclosed('echo $(TEST1', '$('));
test('throws on unclosed backtick command subst', testUnclosed('echo `TEST1', '`'));
test('throws on unclosed arhit subst', testUnclosed('echo $((TEST1', '$(('));
test('throws on unclosed param subst', testUnclosed('echo ${TEST1', '${'));

test('quotes within double quotes', t => {
	const result = bashParser('echo "TEST1 \'TEST2"');
	// utils.logResults(result)
	utils.checkResults(t, result, {
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
	utils.checkResults(t, result, {
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
	utils.checkResults(t, result, {
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
	utils.checkResults(t, result, {
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
	utils.checkResults(t, result, {
		type: 'complete_command',
		commands: [{
			type: 'simple_command',
			name: {type: 'word', text: 'echo'},
			suffix: [{type: 'word', text: 'TEST3 TEST4 TEST5'}]
		}]
	});
});
