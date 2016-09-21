'use strict';
const test = require('ava');
const bashParser = require('../src');
const utils = require('./_utils');

/* eslint-disable camelcase */
test('loc in for statement', t => {
	const cmd =
`for x in a b c; do
	echo $x;
done
`;
	const result = bashParser(cmd, {insertLOC: true});

	const expected = {
		type: 'for',
		loc: {
			startLine: 0,
			startColumn: 0,
			endLine: 2,
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
		wordlist: [
			{
				type: 'word',
				text: 'a',
				loc: {
					startLine: 0,
					startColumn: 9,
					endLine: 0,
					endColumn: 9
				}
			},
			{
				type: 'word',
				text: 'b',
				loc: {
					startLine: 0,
					startColumn: 11,
					endLine: 0,
					endColumn: 11
				}
			},
			{
				type: 'word',
				text: 'c',
				loc: {
					startLine: 0,
					startColumn: 13,
					endLine: 0,
					endColumn: 13
				}
			}
		],
		do: {
			type: 'compound_list',
			commands: [
				{
					type: 'simple_command',
					name: {
						type: 'word',
						text: 'echo',
						loc: {
							startLine: 1,
							startColumn: 1,
							endLine: 1,
							endColumn: 4
						}
					},
					loc: {
						startLine: 1,
						startColumn: 1,
						endLine: 1,
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
							startLine: 1,
							startColumn: 6,
							endLine: 1,
							endColumn: 7
						}
					}]
				}
			],
			loc: {
				startLine: 0,
				startColumn: 16,
				endLine: 2,
				endColumn: 3
			}
		}
	};

	utils.checkResults(t, result.commands[0], expected);
});

test('loc in default for statement', t => {
	const cmd =
`for x do
	echo $x;
done
`;
	const result = bashParser(cmd, {insertLOC: true});
	// utils.logResults(result.commands[0])
	const expected = {
		type: 'for',
		name: {
			text: 'x',
			type: 'name',
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
						text: 'echo',
						type: 'word',
						loc: {
							startLine: 1,
							startColumn: 1,
							endLine: 1,
							endColumn: 4
						}
					},
					loc: {
						startLine: 1,
						startColumn: 1,
						endLine: 1,
						endColumn: 7
					},
					suffix: [
						{
							text: '$x',
							expansion: [
								{
									type: 'parameter_expansion',
									parameter: 'x',
									start: 0,
									end: 2
								}
							],
							type: 'word',
							loc: {
								startLine: 1,
								startColumn: 6,
								endLine: 1,
								endColumn: 7
							}
						}
					]
				}
			],
			loc: {
				startLine: 0,
				startColumn: 6,
				endLine: 2,
				endColumn: 3
			}
		},
		loc: {
			startLine: 0,
			startColumn: 0,
			endLine: 2,
			endColumn: 3
		}
	};

	utils.checkResults(t, result.commands[0], expected);
});
