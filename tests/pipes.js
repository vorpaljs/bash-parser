var test = require('tape');
var parse = require('../parser');

test('long example', function (t) {
	t.deepEqual(parse('first | second'), [
		{
			type: 'command',
			command: {
				type: 'literal',
				value: 'first'
			},
			args: [],
			redirects: [
				{
					type: 'pipe',
					command: {
						type: 'command',
						command: {
							type: 'literal',
							value: 'second'
						},
						args: [],
						redirects: [],
						env: {},
						control: ';',
						next: null
					}
				}
			],
			env: {},
			control: ';',
			next: null
		}
	], 'pipe operators are treated as redirects');

	t.end();
});
