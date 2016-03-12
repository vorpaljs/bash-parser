var test = require('tape');
var parse = require('../parser');

var fs = require('fs');
var path = require('path');

var fixturesDir = path.join(__dirname, 'fixtures/shellcheck-tests');
var fixtureDirs = fs.readdirSync(fixturesDir).map(function (dir) {
	return path.join(fixturesDir, dir);
});

test('shellcheck fixtures', function (t) {
	// allow skipping fixtures entirely
	if (process.env.skip_shellcheck_fixtures) {
		t.skip('skipping shellcheck fixture tests');
		t.end();
		return;
	}
	// allow running individual fixtures directly
	if (
		process.argv[1].match(/shellcheck-fixtures\.js$/) &&
		process.argv.length > 2
		) {
		fixtureDirs = process.argv.slice(2);
	}

	t.plan(fixtureDirs.length);
	fixtureDirs.forEach(function (fixtureDir) {
		var source = fs.readFileSync(path.join(fixtureDir, 'source.sh'), 'utf8');

		var error;
		var ast;
		try {
			error = require(path.join(fixtureDir, 'error.json'));
		} catch (e) {}

		if (!error) {
			try {
				ast = require(path.join(fixtureDir, 'ast.json'));
			} catch (e) {}
		}

		if (error) {
			t.throws(function () {
				parse(source);
			}, error.message ? new RegExp(error.message) : undefined, fixtureDir + ' errored');
		} else if (ast) {
			t.deepEqual(parse(source), ast, dir);
		} else {
			try {
				parse(source);
				t.pass(fixtureDir.replace(fixturesDir + '/', '') + ': parsed sucessfully');
			} catch (e) {
				if (e instanceof parse.SyntaxError) {
					t.fail('parse failed');
					formatParseError(fixtureDir, source, e);
				} else {
					throw e;
				}
			}
		}
	});
	t.end();
});

function formatParseError(dir, source, err) {
	var msg = dir.replace(fixturesDir + '/', '') + ': ' + err.message;
	var start = Math.max(0, err.location.start.offset - 8);
	msg += '\n	' + source.slice(start, start + 10).trim() + '\n';
	for (var i = 0; i <= (err.column - start); i++) {
		msg += '-';
	}
	msg += '^';
	console.error(msg);
}
