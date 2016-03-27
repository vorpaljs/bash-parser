var test = require('tape');
var parse = require('../parser');

test('Echo command.', function (t) {
	t.deepEqual(parse('echo foo=bar'), [{
		type: 'command',
		command: {type: 'literal', value: 'echo'},
		args: [{type: 'literal', value: 'foo=bar'}],
		redirects: [],
		env: {},
		control: ';',
		next: null
	}]);
	t.end();
});

