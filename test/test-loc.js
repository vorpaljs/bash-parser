'use strict';
const test = require('ava');
const bashParser = require('../src');
// const inspect = require('util').inspect;

test('syntax error contains line number', async t => {
	const error = t.throws(() => bashParser('ecoh\necho <'));
	t.is(error.message, 'Parse error on line 2: Unexpected \'EOF\'');
});

// TODO: make test pass
/*
test('AST can include loc', t => {
	const result = bashParser('echo', {insertLOC: true});
	// console.log(inspect(result, {depth: null}))
	t.deepEqual(result.andOrs[0].left[0].prefix, {
		type: 'cmd_prefix',
		list: [{
			text: 'echoword=test'
		}]
	});
});
*/
