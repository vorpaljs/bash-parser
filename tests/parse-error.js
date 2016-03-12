var test = require('tape');
var parse = require('../parser');

test('expected errors', function (t) {
	// These should all produce syntax errors at the given position
	var examples = [
		{input: "echo ( this will fail", position: 5}
	];

	examples.forEach(function (example) {
		t.test('SyntaxError test "' + example.input + '"', function (t) {
			try {
				parse(example.input);
				t.fail("did not throw expected SyntaxError");
			} catch (err) {
				t.equal(err.constructor, parse.SyntaxError, 'threw expected SyntaxError');
				t.equal(example.position, err.location.start.offset, 'SyntaxError has expected offset');
				try {
					var result = parse(example.input.substr(err.location.start.offset), 'continuationStart');
					t.fail('Open paren was parsed as a continuationStart, this is wrong');
					console.log(result);
				} catch (e) {
					t.pass('unbalanced open paren is syntax error');
				}
			}

			t.end();
		});
	});
});
