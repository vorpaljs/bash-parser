'use strict';
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

test('loc are composed by all tokens', t => {
	const result = bashParser('echo 42', {insertLOC: true});
	// console.log(JSON.stringify(result, null, 4));
	t.deepEqual(result.andOrs[0].left[0], {
		type: 'simple_command',
		name: {
			text: 'echo',
			loc: {
				startLine: 0,
				startColumn: 0,
				endLine: 0,
				endColumn: 3
			}
		},
		loc: {
			startLine: 0,
			startColumn: 0,
			endLine: 0,
			endColumn: 6
		},
		suffix: {
			type: 'cmd_suffix',
			list: [
				{
					text: '42',
					loc: {
						startLine: 0,
						startColumn: 5,
						endLine: 0,
						endColumn: 6
					}
				}
			]
		}
	}
);
});
