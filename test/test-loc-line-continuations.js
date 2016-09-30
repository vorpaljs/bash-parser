'use strict';

const test = require('ava');
const bashParser = require('../src');
const utils = require('./_utils');
// const mkloc = require('./_utils').mkloc2;

test('empty line after line continuation', t => {
	const cmd = `echo \\\n\n\necho there`;
	const result = bashParser(cmd);
	// utils.logResults(result);
	const expected = {
		type: 'Script',
		commands: [
			{
				type: 'Command',
				name: {
					text: 'echo',
					type: 'Word'
				}
			},
			{
				type: 'Command',
				name: {
					text: 'echo',
					type: 'Word'
				},
				suffix: [
					{
						text: 'there',
						type: 'Word'
					}
				]
			}
		]
	};
	utils.checkResults(t, result, expected);
});

test('loc take into account line continuations', t => {
	const cmd = 'echo \\\nworld';
	const result = bashParser(cmd, {insertLOC: true});
	// utils.logResults(result);
	const expected = {
		type: 'Script',
		commands: [
			{
				type: 'Command',
				name: {
					text: 'echo',
					type: 'Word',
					loc: {
						start: {
							col: 1,
							row: 1,
							char: 0
						},
						end: {
							col: 4,
							row: 1,
							char: 3
						}
					}
				},
				loc: {
					start: {
						col: 1,
						row: 1,
						char: 0
					},
					end: {
						col: 5,
						row: 2,
						char: 11
					}
				},
				suffix: [
					{
						text: 'world',
						type: 'Word',
						loc: {
							start: {
								col: 1,
								row: 2,
								char: 7
							},
							end: {
								col: 5,
								row: 2,
								char: 11
							}
						}
					}
				]
			}
		],
		loc: {
			start: {
				col: 1,
				row: 1,
				char: 0
			},
			end: {
				col: 5,
				row: 2,
				char: 11
			}
		}
	};

	// utils.logResults(result);

	utils.checkResults(t, result, expected);
});
