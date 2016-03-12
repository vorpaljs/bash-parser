var test = require('tape');
var parse = require('../parser');

test('partial input', function (t) {
	// These should all produce syntax errors at the end of the input
	var inputs = [
		"echo '",
		'echo "',
		'echo `start',
		'echo $(',
		'echo ${',
		'if',
		'while',
		'until'
	];
	t.plan(inputs.length * 2);
	inputs.forEach(function (input) {
		try {
			parse(input);
			t.fail('parse(' + JSON.stringify(input) + ') parsed successfully when it should have thrown a SyntaxError');
		} catch (errTop) {
			t.equal(errTop.constructor, parse.SyntaxError, 'got a SyntaxError');
			var cont;
			try {
				cont = input.slice(errTop.location.start.offset);
				parse(cont, 'continuationStart');
				t.pass(JSON.stringify(cont) + ' is a continuationStart');
			} catch (errCont) {
				t.fail(JSON.stringify(cont) + ' is not a continuationStart ' + errTop + ' ' + errCont);
			}
		}
	});
});
