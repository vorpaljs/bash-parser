var fs = require('fs');
var pegjs = require('pegjs');
var overrideAction = require('pegjs-override-action');
var join = require('path').join;
var input = join(__dirname, '/grammar.pegjs');
var output = join(__dirname, '/parser.js');
var overrides = join(__dirname, '/overrides.js');

if (require.main === module) {
	if (process.argv[2] === '-w') {
		watch();
	} else {
		console.log(getSource());
	}
}

function getSource() {
	delete require.cache[require.resolve('./overrides')];
	var grammar = fs.readFileSync(input, 'utf8');
	var parserSource = pegjs.buildParser(grammar, {
		output: 'source',
		allowedStartRules: [
			'script',
			'command',
			'argument',
			'continuationStart'
		],
		plugins: [overrideAction],
		overrideActionPlugin: require('./overrides')
	});
	return 'module.exports = parse\n\n' +
		parse + '\n' +
		'var parser=' + parserSource + '\n' +
		'module.exports.SyntaxError = parser.SyntaxError\n';
}

function watch() {
	fs.watchFile(input, onChange);
	fs.watchFile(overrides, onChange);

	function onChange(curr, prev) {
		if (curr.mtime > prev.mtime) {
			try {
				var source = getSource();
				fs.writeFileSync(output, source + '\n');
				console.error('Wrote ' + output);
			} catch (err) {
				console.error(err.message);
			}
		}
	}
}

/**
 * This isn't called directly, but stringified into the resulting source
 */
function parse(input, opts) {
// Wrap parser.parse to allow specifying the start rule
// as a shorthand option
	if (!opts) {
		opts = {};
	} else if (typeof opts === 'string') {
		opts = {startRule: opts};
	}
	return parser.parse(input, opts);
}
