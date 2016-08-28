'use strict';
// const json = require('json5');
const test = require('ava');
const bashParser = require('../src');

test('syntax error contains line number', async t => {
	const error = t.throws(() => bashParser('ecoh\necho <'));
	t.is(error.message, 'Parse error on line 2: Unexpected \'EOF\'');
});

test('AST can include loc', t => {
	const result = bashParser('echo', {insertLOC: true});
	t.deepEqual(result.andOrs[0].left[0].name, {
		text: 'echo',
		loc: {
			startLine: 0,
			startColumn: 0,
			endLine: 0,
			endColumn: 3
		}
	});
});
