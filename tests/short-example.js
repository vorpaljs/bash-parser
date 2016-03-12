var test = require('tape');
var parse = require('../parser');

test('short example', function (t) {
	t.deepEqual(parse('ls\n'), [{
		type: 'command',
		command: {type: 'literal', value: 'ls'},
		args: [],
		redirects: [],
		env: {},
		next: null,
		control: ';'
	}]);
	t.end();
});
