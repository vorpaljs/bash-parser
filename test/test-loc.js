'use strict';
const test = require('ava');
const bashParser = require('../src');
const mkloc = require('./_utils').mkloc;
// const utils = require('./_utils');

/* eslint-disable camelcase */
test('syntax error contains line number', async t => {
	const error = t.throws(() => bashParser('ecoh\necho <'));
	t.is(error.message, 'Parse error on line 2: Unexpected \'EOF\'');
});

test('AST can include loc', t => {
	const result = bashParser('echo', {insertLOC: true});
	t.deepEqual(result.commands[0].name, {
		type: 'word',
		text: 'echo',
		loc: mkloc(0, 0, 0, 3)
	});
});

test('double command with only name', t => {
	const result = bashParser('echo; ciao;', {insertLOC: true});
	// logResults(result);
	t.deepEqual(result, {
		type: 'complete_command',
		loc: mkloc(0, 0, 0, 9),
		commands: [
			{
				type: 'simple_command',
				name: {
					type: 'word',
					text: 'echo',
					loc: mkloc(0, 0, 0, 3)
				},
				loc: mkloc(0, 0, 0, 3)
			},
			{
				type: 'simple_command',
				name: {
					type: 'word',
					text: 'ciao',
					loc: mkloc(0, 6, 0, 9)
				},
				loc: mkloc(0, 6, 0, 9)
			}
		]
	});
});

test('loc are composed by all tokens', t => {
	const result = bashParser('echo 42', {insertLOC: true});
	// console.log(JSON.stringify(result, null, 4));
	t.deepEqual(result.commands[0], {
		type: 'simple_command',
		name: {
			type: 'word',
			text: 'echo',
			loc: mkloc(0, 0, 0, 3)
		},
		loc: mkloc(0, 0, 0, 6),
		suffix: [{
			type: 'word',
			text: '42',
			loc: mkloc(0, 5, 0, 6)
		}]
	});
});

test('loc works with multiple newlines', t => {
	const result = bashParser('\n\n\necho 42', {insertLOC: true});
	t.deepEqual(result.commands[0], {
		type: 'simple_command',
		name: {
			type: 'word',
			text: 'echo',
			loc: mkloc(3, 0, 3, 3)
		},
		loc: mkloc(3, 0, 3, 6),
		suffix: [{
			type: 'word',
			text: '42',
			loc: mkloc(3, 5, 3, 6)
		}]
	});
});

test('loc with LINEBREAK_IN statement', t => {
	const cmd =
`for x
	in ; do
	echo $x;
done
`;
	const result = bashParser(cmd, {insertLOC: true});
	// utils.logResults(result);
	const expected = {
		type: 'for',
		loc: {
			startLine: 0,
			startColumn: 0,
			endLine: 3,
			endColumn: 3
		},
		name: {
			type: 'name',
			text: 'x',
			loc: {
				startLine: 0,
				startColumn: 4,
				endLine: 0,
				endColumn: 4
			}
		},
		do: {
			type: 'compound_list',
			commands: [
				{
					type: 'simple_command',
					name: {
						type: 'word',
						text: 'echo',
						loc: {
							startLine: 2,
							startColumn: 1,
							endLine: 2,
							endColumn: 4
						}
					},
					loc: {
						startLine: 2,
						startColumn: 1,
						endLine: 2,
						endColumn: 7
					},
					suffix: [{
						type: 'word',
						text: '$x',
						expansion: [
							{
								type: 'parameter_expansion',
								parameter: 'x',
								start: 0,
								end: 2
							}
						],
						loc: {
							startLine: 2,
							startColumn: 6,
							endLine: 2,
							endColumn: 7
						}
					}]
				}
			],
			loc: {
				startLine: 1,
				startColumn: 6,
				endLine: 3,
				endColumn: 3
			}
		}
	};

	t.deepEqual(result.commands[0], expected);
});
