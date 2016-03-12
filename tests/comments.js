var test = require('tape');
var parse = require('../parser');

test('comments', function (t) {
	t.deepEqual(parse('a="b" # very important! do not touch'), [{
		type: 'variableAssignment',
		name: 'a',
		value: {type: 'literal', value: 'b'},
		control: ';',
		next: null
	}]);

	t.deepEqual(parse([
		'# leading with a comment also works',
		'a=b'
	].join('\n')), [{
		type: 'variableAssignment',
		name: 'a',
		value: {type: 'literal', value: 'b'},
		control: ';',
		next: null
	}]);

	t.end();
});
