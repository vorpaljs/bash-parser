'use strict';

const test = require('ava');
const bashParser = require('../src');
const utils = require('./_utils');

test('command substitution', t => {
	const result = bashParser('variable=$(echo ciao)');
	// utils.logResults(result)
	delete result.commands[0].prefix[0].expansion[0].commandAST;
	utils.checkResults(t, result.commands[0].prefix, [{
		type: 'AssignmentWord',
		text: 'variable=$(echo ciao)',
		expansion: [{
			command: 'echo ciao',
			type: 'CommandExpansion',
			loc: {
				start: 9,
				end: 20
			}
		}]
	}]);
});

test('command substitution skip escaped dollar', t => {
	const result = bashParser('echo "\\$\\(echo ciao)"');
	// utils.logResults(result)
	utils.checkResults(t, result.commands[0].suffix, [{
		type: 'Word',
		text: '\\$\\(echo ciao)'
	}]);
});

test('command substitution skip escaped backtick', t => {
	const err = t.throws(() => bashParser('echo "\\`echo ciao`"'));
	t.is(err.message, 'Unclosed `');
});

test('command substitution skip single quoted words', t => {
	const result = bashParser('echo \'$(echo ciao)\'');
	// utils.logResults(result)
	utils.checkResults(t, result.commands[0].suffix, [{
		type: 'Word',
		text: '$(echo ciao)'
	}]);
});

test('command substitution with backticks skip single quoted words', t => {
	const result = bashParser('echo \'`echo ciao`\'');
	// utils.logResults(result)
	utils.checkResults(t, result.commands[0].suffix, [{type: 'Word', text: '`echo ciao`'}]);
});

test('command substitution in suffix', t => {
	const result = bashParser('echo $(ciao)');
	delete result.commands[0].suffix[0].expansion[0].commandAST;
	utils.checkResults(t, result.commands[0].suffix, [{
		type: 'Word',
		text: '$(ciao)',
		expansion: [{
			command: 'ciao',
			type: 'CommandExpansion',
			loc: {
				start: 0,
				end: 6
			}
		}]
	}]);
});

test('command substitution in suffix with backticks', t => {
	const result = bashParser('echo `ciao`');
	delete result.commands[0].suffix[0].expansion[0].commandAST;

	utils.checkResults(t, result.commands[0].suffix, [{
		type: 'Word',
		text: '`ciao`',
		expansion: [{
			command: 'ciao',
			type: 'CommandExpansion',
			loc: {
				start: 0,
				end: 5
			}
		}]
	}]);
});

test('command ast is recursively parsed', t => {
	const result = bashParser('variable=$(echo ciao)')
		.commands[0].prefix[0].expansion[0].commandAST;

	// utils.logResults(result);

	utils.checkResults(t, result, {
		type: 'Script',
		commands: [{
			type: 'Command',
			name: {type: 'Word', text: 'echo'},
			suffix: [{type: 'Word', text: 'ciao'}]
		}]
	});
});

test('command substitution with backticks', t => {
	const result = bashParser('variable=`echo ciao`');
	delete result.commands[0].prefix[0].expansion[0].commandAST;

	utils.checkResults(t, result.commands[0].prefix, [{
		type: 'AssignmentWord',
		text: 'variable=`echo ciao`',
		expansion: [{
			command: 'echo ciao',
			type: 'CommandExpansion',
			loc: {
				start: 9,
				end: 19
			}
		}]
	}]);
});

test('quoted backtick are removed within command substitution with backticks', t => {
	const result = bashParser('variable=`echo \\`echo ciao\\``');
	delete result.commands[0].prefix[0].expansion[0].commandAST;
	// utils.logResults(result);

	utils.checkResults(t, result.commands[0].prefix, [{
		type: 'AssignmentWord',
		text: 'variable=`echo \\`echo ciao\\``',
		expansion: [{
			command: 'echo `echo ciao`',
			type: 'CommandExpansion',
			loc: {
				start: 9,
				end: 28
			}
		}]
	}]);
});

test('quoted backtick are not removed within command substitution with parenthesis', t => {
	const result = bashParser('variable=$(echo \\`echo ciao\\`)');
	delete result.commands[0].prefix[0].expansion[0].commandAST;
	utils.checkResults(t, result.commands[0].prefix, [{
		type: 'AssignmentWord',
		text: 'variable=$(echo \\`echo ciao\\`)',
		expansion: [{
			command: 'echo \\`echo ciao\\`',
			type: 'CommandExpansion',
			loc: {
				start: 9,
				end: 29
			}
		}]
	}]);
});

test('resolve double command', t => {
	const result = bashParser('"foo $(other) $(one) baz"', {
		execCommand() {
			return 'bar';
		}
	});
	// utils.logResults(result.commands[0]);
	delete result.commands[0].name.expansion[0].commandAST;
	delete result.commands[0].name.expansion[1].commandAST;

	// utils.logResults(result.commands[0]);
	utils.checkResults(t, result.commands[0], {
		type: 'Command',
		name: {
			text: 'foo bar bar baz',
			originalText: '"foo $(other) $(one) baz"',
			expansion: [{
				command: 'other',
				loc: {start: 5, end: 12},
				resolved: true,
				type: 'CommandExpansion'
			}, {
				command: 'one',
				loc: {start: 14, end: 19},
				resolved: true,
				type: 'CommandExpansion'
			}],
			type: 'Word'
		}
	});
});

test('resolve double command with backticks', t => {
	const result = bashParser('"foo `other` `one` baz"', {
		execCommand() {
			return 'bar';
		}
	});
	delete result.commands[0].name.expansion[0].commandAST;
	delete result.commands[0].name.expansion[1].commandAST;

	// utils.logResults(result.commands[0]);
	utils.checkResults(t, result.commands[0], {
		type: 'Command',
		name: {
			text: 'foo bar bar baz',
			originalText: '"foo `other` `one` baz"',
			expansion: [{
				command: 'other',
				loc: {start: 5, end: 11},
				resolved: true,
				type: 'CommandExpansion'
			}, {
				command: 'one',
				loc: {start: 13, end: 17},
				resolved: true,
				type: 'CommandExpansion'
			}],
			type: 'Word'
		}
	});
});

test('last newlines are removed from command output', t => {
	const result = bashParser('"foo $(other) baz"', {
		execCommand() {
			return 'bar\n\n';
		}
	});
	delete result.commands[0].name.expansion[0].commandAST;
	// utils.logResults(result)
	utils.checkResults(t, result.commands[0], {
		type: 'Command',
		name: {
			text: 'foo bar baz',
			originalText: '"foo $(other) baz"',
			expansion: [{
				command: 'other',
				loc: {start: 5, end: 12},
				resolved: true,
				type: 'CommandExpansion'
			}],
			type: 'Word'
		}
	});
});

test('field splitting', t => {
	const result = bashParser('say $(other) plz', {
		execCommand() {
			return 'foo\tbar baz';
		},

		resolveEnv() {
			return '\t ';
		}
	});

	// utils.logResults(result)

	delete result.commands[0].suffix[0].expansion[0].commandAST;
	delete result.commands[0].suffix[1].expansion[0].commandAST;
	delete result.commands[0].suffix[2].expansion[0].commandAST;

	utils.checkResults(t, result.commands[0], {
		type: 'Command',
		name: {
			text: 'say',
			type: 'Word'
		},
		suffix: [{
			text: 'foo',
			expansion: [{
				command: 'other',
				loc: {start: 0, end: 7},
				type: 'CommandExpansion',
				resolved: true
			}],
			originalText: '$(other)',
			type: 'Word',
			joined: 'foo\u0000bar\u0000baz',
			fieldIdx: 0
		}, {
			text: 'bar',
			expansion: [{
				command: 'other',
				loc: {start: 0, end: 7},
				type: 'CommandExpansion',
				resolved: true
			}],
			originalText: '$(other)',
			type: 'Word',
			joined: 'foo\u0000bar\u0000baz',
			fieldIdx: 1
		}, {
			text: 'baz',
			expansion: [{
				command: 'other',
				loc: {start: 0, end: 7},
				type: 'CommandExpansion',
				resolved: true
			}],
			originalText: '$(other)',
			type: 'Word',
			joined: 'foo\u0000bar\u0000baz',
			fieldIdx: 2
		}, {
			text: 'plz',
			type: 'Word'
		}]
	});
});
