var test = require('tape');
var parse = require('../parser');

test('Multi-line strings', function (t) {
	var input = [
		'"This',
		'is a',
		'multiline',
		'string"'
	].join('\n');

	var arg = parse(input, 'argument');
	t.deepEqual(arg, {
		type: 'literal',
		value: 'This\nis a\nmultiline\nstring'
	}, 'multi-line string literals are one argument');
	t.end();
});
