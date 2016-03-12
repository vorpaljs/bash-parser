var test = require('tape');
var parse = require('../parser');

test('long example', function (t) {
	var input = [
		'blah >(substituteCommand --with args)',
		'first | second',
		'echo ${what/hot/not} ok \'singleQuoted arg\'\"doubleQuoted $var\" > here'
	].join('\n');

	t.deepEqual(parse(input), [{
		type: 'command',
		command: {
			type: 'literal',
			value: 'blah'
		},
		args: [{
			type: 'processSubstitution',
			readWrite: '>',
			commands: [{
				type: 'command',
				command: {
					type: 'literal',
					value: 'substituteCommand'
				},
				args: [{
					type: 'literal',
					value: '--with'
				}, {
					type: 'literal',
					value: 'args'
				}],
				redirects: [],
				env: {},
				control: ';',
				next: null
			}]
		}],
		redirects: [],
		env: {},
		control: ';',
		next: null
	}, {
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
	},
	{
		type: 'command',
		command: {
			type: 'literal',
			value: 'echo'
		},
		args: [{
			type: 'variableSubstitution',
			expression: 'what/hot/not'
		}, {
			type: 'literal',
			value: 'ok'
		}, {
			type: 'concatenation',
			pieces: [{
				type: 'literal',
				value: 'singleQuoted arg'
			}, {
				type: 'literal',
				value: 'doubleQuoted '
			}, {
				type: 'variable',
				name: 'var'
			}]
		}],
		redirects: [{
			type: 'redirectFd',
			fd: 1,
			op: '>',
			filename: {
				type: 'literal',
				value: 'here'
			}
		}],
		env: {},
		control: ';',
		next: null
	}
	]);

	t.end();
});
