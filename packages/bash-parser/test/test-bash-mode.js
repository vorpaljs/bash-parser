'use strict';

const test = require('ava');
const bashParser = require('../src');
const utils = require('./_utils');

test('alias on reserved word', t => {
	const result = bashParser('if world', {
		mode: 'bash',
		resolveAlias: name => {
			return name === 'if' ? 'echo' : undefined;
		}
	});
	utils.checkResults(t, result, {
		type: 'Script',
		commands: [{
			type: 'Command',
			name: {type: 'Word', text: 'echo'},
			suffix: [{type: 'Word', text: 'world'}]
		}]
	});
});

test('parameter substitution with Substring Expansion', t => {
	const result = bashParser('echo ${text:2:4}', {mode: 'bash'})
		.commands[0].suffix[0].expansion[0];

	utils.checkResults(t, result, {
		loc: {
			start: 0,
			end: 10
		},
		parameter: 'text',
		type: 'ParameterExpansion',
		op: 'substring',
		offset: 2,
		length: 4
	});
});

test('parameter substitution with prefix', t => {
	const result = bashParser('echo ${!text*}', {mode: 'bash'})
		.commands[0].suffix[0].expansion[0];
	utils.checkResults(t, result, {
		loc: {
			start: 0,
			end: 8
		},
		type: 'ParameterExpansion',
		op: 'prefix',
		prefix: 'text',
		expandWords: false
	});
});

test('parameter substitution with prefix and word expansion', t => {
	const result = bashParser('echo ${!text@}', {mode: 'bash'})
		.commands[0].suffix[0].expansion[0];

	utils.checkResults(t, result, {
		loc: {
			start: 0,
			end: 8
		},
		prefix: 'text',
		type: 'ParameterExpansion',
		op: 'prefix',
		expandWords: true
	});
});

test('parameter substitution: length is optional', t => {
	const result = bashParser('echo ${text:2}', {mode: 'bash'})
		.commands[0].suffix[0].expansion[0];

	utils.checkResults(t, result, {
		loc: {
			start: 0,
			end: 8
		},
		parameter: 'text',
		type: 'ParameterExpansion',
		op: 'substring',
		offset: 2
	});
});

test('parameter substitution with string replacement', t => {
	const result = bashParser('echo ${var/a/b}', {mode: 'bash'})
		.commands[0].suffix[0].expansion[0];
	utils.checkResults(t, result, {
		loc: {
			start: 0,
			end: 9
		},
		type: 'ParameterExpansion',
		op: 'stringReplace',
		parameter: 'var',
		substitute: 'a',
		replace: 'b',
		globally: false
	});
});

test('parameter substitution with string replacement - globally', t => {
	const result = bashParser('echo ${var//a/b}', {mode: 'bash'})
		.commands[0].suffix[0].expansion[0];
	utils.checkResults(t, result, {
		loc: {
			start: 0,
			end: 10
		},
		type: 'ParameterExpansion',
		op: 'stringReplace',
		parameter: 'var',
		substitute: 'a',
		replace: 'b',
		globally: true
	});
});

test('parameter substitution with array indices', t => {
	const result = bashParser('echo ${!text[*]}', {mode: 'bash'})
		.commands[0].suffix[0].expansion[0];

	// utils.logResults(result);

	utils.checkResults(t, result, {
		loc: {
			start: 0,
			end: 10
		},
		type: 'ParameterExpansion',
		op: 'arrayIndices',
		parameter: 'text',
		expandWords: false
	});
});

test('parameter substitution with array indices and word expansion', t => {
	const result = bashParser('echo ${!text[@]}', {mode: 'bash'})
		.commands[0].suffix[0].expansion[0];

	utils.checkResults(t, result, {
		loc: {
			start: 0,
			end: 10
		},
		parameter: 'text',
		type: 'ParameterExpansion',
		op: 'arrayIndices',
		expandWords: true
	});
});

test('parameter substitution with case change upper case and pattern', t => {
	const result = bashParser('echo ${text^t}', {mode: 'bash'})
		.commands[0].suffix[0].expansion[0];
	// utils.logResults(result);
	utils.checkResults(t, result, {
		loc: {
			start: 0,
			end: 8
		},
		parameter: 'text',
		pattern: 't',
		type: 'ParameterExpansion',
		op: 'caseChange',
		case: 'upper',
		globally: false
	});
});

test('parameter substitution with case change upper case globally and pattern', t => {
	const result = bashParser('echo ${text^^t}', {mode: 'bash'})
		.commands[0].suffix[0].expansion[0];
	// utils.logResults(result);
	utils.checkResults(t, result, {
		loc: {
			start: 0,
			end: 9
		},
		parameter: 'text',
		pattern: 't',
		type: 'ParameterExpansion',
		op: 'caseChange',
		case: 'upper',
		globally: true
	});
});

test('parameter substitution with case change lower case and pattern', t => {
	const result = bashParser('echo ${text,t}', {mode: 'bash'})
		.commands[0].suffix[0].expansion[0];
	// utils.logResults(result);
	utils.checkResults(t, result, {
		loc: {
			start: 0,
			end: 8
		},
		parameter: 'text',
		pattern: 't',
		type: 'ParameterExpansion',
		op: 'caseChange',
		case: 'lower',
		globally: false
	});
});

test('parameter substitution with case change lower case globally and pattern', t => {
	const result = bashParser('echo ${text,,t}', {mode: 'bash'})
		.commands[0].suffix[0].expansion[0];
	// utils.logResults(result);
	utils.checkResults(t, result, {
		loc: {
			start: 0,
			end: 9
		},
		parameter: 'text',
		pattern: 't',
		type: 'ParameterExpansion',
		op: 'caseChange',
		case: 'lower',
		globally: true
	});
});

test('parameter substitution with case change upper case and default pattern', t => {
	const result = bashParser('echo ${text^}', {mode: 'bash'})
		.commands[0].suffix[0].expansion[0];
	utils.checkResults(t, result, {
		loc: {
			start: 0,
			end: 7
		},
		parameter: 'text',
		pattern: '?',
		type: 'ParameterExpansion',
		op: 'caseChange',
		case: 'upper',
		globally: false
	});
});

test('parameter substitution with case change upper case globally and default pattern', t => {
	const result = bashParser('echo ${text^^}', {mode: 'bash'})
		.commands[0].suffix[0].expansion[0];
	// utils.logResults(result);
	utils.checkResults(t, result, {
		loc: {
			start: 0,
			end: 8
		},
		parameter: 'text',
		pattern: '?',
		type: 'ParameterExpansion',
		op: 'caseChange',
		case: 'upper',
		globally: true
	});
});

test('parameter substitution with case change lower case and default pattern', t => {
	const result = bashParser('echo ${text,}', {mode: 'bash'})
		.commands[0].suffix[0].expansion[0];

	utils.checkResults(t, result, {
		loc: {
			start: 0,
			end: 7
		},
		parameter: 'text',
		pattern: '?',
		type: 'ParameterExpansion',
		op: 'caseChange',
		case: 'lower',
		globally: false
	});
});

test('parameter substitution with case change lower case globally and default pattern', t => {
	const result = bashParser('echo ${text,,}', {mode: 'bash'})
		.commands[0].suffix[0].expansion[0];
	utils.checkResults(t, result, {
		loc: {
			start: 0,
			end: 8
		},
		parameter: 'text',
		pattern: '?',
		type: 'ParameterExpansion',
		op: 'caseChange',
		case: 'lower',
		globally: true
	});
});
