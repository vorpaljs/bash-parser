var test = require('tape');
var parse = require('../parser');

test('env vars', function (t) {
	t.deepEqual(parse('Y=1 echo $Y')[0], {
		type: 'command',
		command: {type: 'literal', value: "echo"},
		args: [
			{type: 'variable', name: 'Y'}
		],
		redirects: [],
		env: {Y: {type: 'literal', value: '1'}},
		control: ';',
		next: null
	});
	t.end();
});

