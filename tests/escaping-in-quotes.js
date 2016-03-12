var test = require('tape');
var parse = require('../parser');

test('escaping in quotes', function (t) {
	var arg = parse('"An escaped double-quote: \\""', 'argument');
	t.deepEqual(arg, {
		type: 'literal',
		value: 'An escaped double-quote: \"'
	}, 'Can escape double-quotes');

	arg = parse('"An escaped \\$dollar sign"', 'argument');
	t.deepEqual(arg, {
		type: 'literal',
		value: 'An escaped $dollar sign'
	}, 'Can escape dollar signs');

	t.end();
});
