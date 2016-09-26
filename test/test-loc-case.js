'use strict';
import 'babel-register';
const test = require('ava');
const bashParser = require('../src');
const utils = require('./_utils');
/* eslint-disable camelcase */

test('case statement has loc', t => {
	const cmd =
`case foo in
	* )
		echo bar;;
esac
`;
	const result = bashParser(cmd, {insertLOC: true});

	const expected = {
		type: 'case',
		clause: {
			type: 'word',
			text: 'foo',
			loc: {
				startLine: 0,
				startColumn: 5,
				endLine: 0,
				endColumn: 7
			}
		},
		cases: [
			{
				type: 'case_item',
				pattern: [
					{
						type: 'word',
						text: '*',
						loc: {
							startLine: 1,
							startColumn: 1,
							endLine: 1,
							endColumn: 1
						}
					}
				],
				body: {
					type: 'compound_list',
					commands: [
						{
							type: 'simple_command',
							name: {
								type: 'word',
								text: 'echo',
								loc: {
									startLine: 2,
									startColumn: 2,
									endLine: 2,
									endColumn: 5
								}
							},
							loc: {
								startLine: 2,
								startColumn: 2,
								endLine: 2,
								endColumn: 9
							},
							suffix: [{
								type: 'word',
								text: 'bar',
								loc: {
									startLine: 2,
									startColumn: 7,
									endLine: 2,
									endColumn: 9
								}
							}]
						}
					],
					loc: {
						startLine: 2,
						startColumn: 2,
						endLine: 2,
						endColumn: 9
					}
				},
				loc: {
					startLine: 1,
					startColumn: 1,
					endLine: 2,
					endColumn: 11
				}
			}
		],
		loc: {
			startLine: 0,
			startColumn: 0,
			endLine: 3,
			endColumn: 3
		}
	};
	// utils.logResults(result.commands[0].commands[0]);

	utils.checkResults(t, result.commands[0], expected);
});
