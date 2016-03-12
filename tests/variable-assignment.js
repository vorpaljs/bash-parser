var test = require('tape');
var parse = require('../parser');

test('Variable assignments', function (t) {
	t.deepEqual(parse('a="b"'), [{
		type: 'variableAssignment',
		name: 'a',
		value: {type: 'literal', value: 'b'},
		control: ';',
		next: null
	}]);
	t.end();
});

test('Variable assignments before command', function (t) {
	t.deepEqual(parse('a="b" some-command'), [{
		type: 'command',
		command: {type: 'literal', value: 'some-command'},
		args: [],
		redirects: [],
		env: {
			a: {type: 'literal', value: 'b'}
		},
		control: ';',
		next: null
	}]);
	t.end();
});

test('Empty variable assignments', function (t) {
	t.deepEqual(parse('a='), [{
		type: 'variableAssignment',
		name: 'a',
		value: null,
		control: ';',
		next: null
	}]);
	t.end();
});
