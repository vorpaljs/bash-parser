'use strict';
import 'babel-register';
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

	const expected = {
		type: 'function',
		loc: {
			startLine: 0,
			startColumn: 0,
			endLine: 2,
			endColumn: 0
		},
		name: {
			type: 'name',
			text: 'foo',
			loc: {
				startLine: 0,
				startColumn: 0,
				endLine: 0,
				endColumn: 2
			}
		},
		body: {
			type: 'compound_list',
			loc: {
				startLine: 0,
				startColumn: 7,
				endLine: 2,
				endColumn: 0
			},
			commands: [
				{
					type: 'simple_command',
					name: {
						type: 'word',
						text: 'command',
						loc: {
							startLine: 1,
							startColumn: 1,
							endLine: 1,
							endColumn: 7
						}
					},
					loc: {
						startLine: 1,
						startColumn: 1,
						endLine: 1,
						endColumn: 17
					},
					suffix: [{
						type: 'word',
						text: 'bar',
						loc: {
							startLine: 1,
							startColumn: 9,
							endLine: 1,
							endColumn: 11
						}
					}, {
						type: 'word',
						text: '--lol',
						loc: {
							startLine: 1,
							startColumn: 13,
							endLine: 1,
							endColumn: 17
						}
					}]
				}
			]

		}
	};

	utils.checkResults(t, result.commands[0], expected);
});
