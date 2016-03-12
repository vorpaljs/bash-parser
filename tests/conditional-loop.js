var test = require('tape');
var parse = require('../parser');

test('conditional loop', function (t) {
	t.plan(3);

	var statement = parse('while true; do echo 1; done')[0];

	t.deepEqual(statement, {
		type: 'whileLoop',
		test: [{
			type: 'command',
			command: {
				type: 'literal',
				value: 'true'
			},
			args: [],
			redirects: [],
			env: {},
			control: ';',
			next: null
		}],
		body: [{
			type: 'command',
			command: {
				type: 'literal',
				value: 'echo'
			},
			args: [
				{
					type: 'literal',
					value: '1'
				}],
			redirects: [],
			env: {},
			control: ';',
			next: null
		}],
		next: null,
		control: ';'
	}, 'can parse a while loop');

	var ast = parse('while true && false; do blah; done');
	t.ok(ast[0].test[0].next, 'Can use chaining in test-commands');

	try {
		var input = 'while echo 1 && do blah; done';
		parse(input);
	} catch (err) {
		t.pass('make sure this is a syntax error');
	}

	t.end();
});
