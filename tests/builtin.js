var test = require('tape');
var parse = require('../parser');

test('condition builtins', function (t) {
	t.deepEqual(parse('[ 0 ]')[0], {
		type: 'command',
		command: '[',
		args: [
			{type: 'literal', value: '0'},
			{type: 'literal', value: ']'}
		],
		redirects: [],
		env: {},
		control: ';',
		next: null
	});
	t.end();
});

