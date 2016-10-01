'use strict';

const test = require('ava');
const bashParser = require('../src');
const utils = require('./_utils');

/* eslint-disable camelcase */
test('loc in function declaration', t => {
	const cmd =
`foo () {
	command bar --lol;
}
`;
	const result = bashParser(cmd, {insertLOC: true});
	// utils.logResults(result)
	const expected = {
		type: 'Function',
		name: {
			text: 'foo',
			type: 'Name',
			loc: {
				start: {
					col: 1,
					row: 1,
					char: 0
				},
				end: {
					col: 3,
					row: 1,
					char: 2
				}
			}
		},
		body: {
			type: 'CompoundList',
			commands: [
				{
					type: 'Command',
					name: {
						text: 'command',
						type: 'Word',
						loc: {
							start: {
								col: 2,
								row: 2,
								char: 10
							},
							end: {
								col: 8,
								row: 2,
								char: 16
							}
						}
					},
					loc: {
						start: {
							col: 2,
							row: 2,
							char: 10
						},
						end: {
							col: 18,
							row: 2,
							char: 26
						}
					},
					suffix: [
						{
							text: 'bar',
							type: 'Word',
							loc: {
								start: {
									col: 10,
									row: 2,
									char: 18
								},
								end: {
									col: 12,
									row: 2,
									char: 20
								}
							}
						},
						{
							text: '--lol',
							type: 'Word',
							loc: {
								start: {
									col: 14,
									row: 2,
									char: 22
								},
								end: {
									col: 18,
									row: 2,
									char: 26
								}
							}
						}
					]
				}
			],
			loc: {
				start: {
					col: 8,
					row: 1,
					char: 7
				},
				end: {
					col: 1,
					row: 3,
					char: 29
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
				col: 1,
				row: 3,
				char: 29
			}
		}
	};

	utils.checkResults(t, result.commands[0], expected);
});
