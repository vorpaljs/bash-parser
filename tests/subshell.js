var test = require('tape');
var parse = require('../parser');

test('subshells', function (t) {
	var expect = [{
		type: 'subshell',
		statements: [{
			type: 'command',
			command: {type: 'literal', value: 'cd'},
			args: [
				{type: 'literal', value: '/foo'}
			],
			redirects: [],
			env: {},
			control: ';',
			next: null
		}, {
			type: 'command',
			command: {type: 'literal', value: 'echo'},
			args: [
				{type: 'glob', value: '*'}
			],
			redirects: [],
			env: {},
			control: ';',
			next: null
		}],
		control: ';',
		next: null
	}];

	t.deepEqual(parse('( cd /foo; echo * )'), expect,
							'can separate commands with ";"');

	t.end();
});

