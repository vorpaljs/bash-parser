var test = require('tape');
var parse = require('../parser');

test('concatenation', function (t) {
	var arg = parse('"two "\' strings\'', 'argument');
	t.deepEqual(arg,
							{type: 'literal', value: 'two	strings'},
							'concatenated literals are flattened');

	arg = parse('$var"and a string"', 'argument');
	t.deepEqual(arg, {
		type: 'concatenation',
		pieces: [
			{type: 'variable', name: 'var'},
			{type: 'literal', value: 'and a string'}
		]
	}, 'can concatenate $var and strings');

	arg = parse('"it\'s easy to switch "\'"back"\'" and "\'"forth"\'',
									'argument');
	t.deepEqual(arg, {
		type: 'literal',
		value: 'it\'s easy to switch "back" and "forth"'
	}, 'can concatenate alternating quote contexts');

	t.end();
});
