var test = require('tape');
var parse = require('../parser');

test('for loop', function (t) {
	t.plan(1);

	var statement = parse('for x in a b c; do echo $x; done')[0];

	t.deepEqual(statement, {
		type: 'forLoop',
		loopVariable: 'x',
		subjects: [{
			type: 'literal',
			value: 'a'
		}, {
			type: 'literal',
			value: 'b'
		}, {
			type: 'literal',
			value: 'c'
		}],
		body: [{
			type: 'command',
			command: {
				type: 'literal',
				value: 'echo'
			},
			args: [{
				type: 'variable',
				name: 'x'
			}],
			redirects: [],
			env: {},
			control: ';',
			next: null
		}],
		next: null,
		control: ';'
	}, 'can parse a for loop');
});
