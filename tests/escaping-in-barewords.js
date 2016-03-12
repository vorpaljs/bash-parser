var test = require('tape');
var parse = require('../parser');

test('escaping meta characters in barewords', function (t) {
	var arg = parse('I\\ am\\ one\\ arg', 'argument');
	t.deepEqual(arg, {
		type: 'literal',
		value: 'I am one arg'
	}, 'Can escape spaces');

	arg = parse('\\$dollar_dollar_bill', 'argument');
	t.deepEqual(arg, {
		type: 'literal',
		value: '$dollar_dollar_bill'
	}, 'Can escape $');

	arg = parse('\\>\\ no\\ redirect', 'argument');
	t.deepEqual(arg, {
		type: 'literal',
		value: '> no redirect'
	}, 'Can escape >');

	arg = parse('dollar_\\$dollar_bill', 'argument');
	t.deepEqual(arg, {
		type: 'literal',
		value: 'dollar_$dollar_bill'
	}, 'Can escape mid-word');

	t.end();
});
