var test = require('tape');
var parse = require('../parser');

test('interpolation in quotes', function (t) {
	var arg = parse('"interpolated $variable"', 'argument');
	t.deepEqual(arg, {
		type: 'concatenation',
		pieces: [
			{type: 'literal', value: 'interpolated '},
			{type: 'variable', name: 'variable'}
		]
	}, 'Can interpolate environment variables');

	arg = parse('"interpolated ${variable/sub/rep}"', 'argument');
	t.deepEqual(arg, {
		type: 'concatenation',
		pieces: [
			{type: 'literal', value: 'interpolated '},
			{type: 'variableSubstitution', expression: 'variable/sub/rep'}
		]
	}, 'Can interpolate variables substitutions');

	arg = parse('"interpolated `backtick command`"', 'argument');
	t.deepEqual(arg, {
		type: 'concatenation',
		pieces: [
			{type: 'literal', value: 'interpolated '},
			{type: 'commandSubstitution',
				commands: [
					{type: 'command',
						command: {type: 'literal', value: 'backtick'},
						args: [
							{type: 'literal', value: 'command'}
						],
						redirects: [],
						env: {},
						control: ';',
						next: null}
				]
			}
		]
	}, 'Can interpolate backTicks (but you really shouldn\'t!)');

	arg = parse('"interpolated $(command1; command2)"', 'argument');
	t.deepEqual(arg, {
		type: 'concatenation',
		pieces: [
			{type: "literal", value: 'interpolated '},
			{type: "commandSubstitution",
				commands: [
					{type: 'command',
						command: {type: 'literal', value: 'command1'},
						args: [],
						redirects: [],
						env: {},
						control: ';',
						next: null},
					{type: 'command',
						command: {type: 'literal', value: 'command2'},
						args: [],
						redirects: [],
						env: {},
						control: ';',
						next: null}
				]
			}]
	}, "Can interpolate commands with $() (better idea!)");

	t.end();
});
