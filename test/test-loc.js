'use strict';
const test = require('ava');
const bashParser = require('../src');
const mkloc = require('./_utils').mkloc;
// const logResults = require('./_utils').logResults;

test('syntax error contains line number', async t => {
	const error = t.throws(() => bashParser('ecoh\necho <'));
	t.is(error.message, 'Parse error on line 2: Unexpected \'EOF\'');
});

test('AST can include loc', t => {
	const result = bashParser('echo', {insertLOC: true});
	t.deepEqual(result.andOrs[0].left[0].name, {
		text: 'echo',
		loc: mkloc(0, 0, 0, 3)
	});
});

test('double command with only name', t => {
	const result = bashParser('echo; ciao;', {insertLOC: true});
	// logResults(result);
	t.deepEqual(result, {
		type: 'list',
		loc: mkloc(0, 0, 0, 9),
		andOrs: [
			{
				type: 'andOr',
				left: [
					{
						type: 'simple_command',
						name: {
							text: 'echo',
							loc: mkloc(0, 0, 0, 3)
						},
						loc: mkloc(0, 0, 0, 3)
					}
				],
				loc: mkloc(0, 0, 0, 3)
			},
			{
				type: 'andOr',
				left: [
					{
						type: 'simple_command',
						name: {
							text: 'ciao',
							loc: mkloc(0, 6, 0, 9)
						},
						loc: mkloc(0, 6, 0, 9)
					}
				],
				loc: mkloc(0, 6, 0, 9)
			}
		]
	});
});

test('loc are composed by all tokens', t => {
	const result = bashParser('echo 42', {insertLOC: true});
	// console.log(JSON.stringify(result, null, 4));
	t.deepEqual(result.andOrs[0].left[0], {
		type: 'simple_command',
		name: {
			text: 'echo',
			loc: mkloc(0, 0, 0, 3)
		},
		loc: mkloc(0, 0, 0, 6),
		suffix: {
			type: 'cmd_suffix',
			list: [
				{
					text: '42',
					loc: mkloc(0, 5, 0, 6)
				}
			]
		}
	}
);
});
