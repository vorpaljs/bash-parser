var test = require('tape');
var parse = require('../parser');

test('globs', function (t) {
	t.deepEqual(parse('thing*/**.whatever', 'argument'), {
		type: 'glob',
		value: 'thing*/**.whatever'
	}, 'Can parse * globs');

	t.deepEqual(parse('thing-??.txt', 'argument'), {
		type: 'glob',
		value: 'thing-??.txt'
	}, 'Can parse ? globs');

	t.deepEqual(parse('thing-[1-3][0-9].txt', 'argument'), {
		type: 'glob',
		value: 'thing-[1-3][0-9].txt'
	}, 'Can parse character range globs');
	t.end();
});
