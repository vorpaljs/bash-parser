'use strict';
const test = require('ava');
// const json = require('json5');
// const {diff} = require('rus-diff');
const bashParser = require('../src');
/* eslint-disable camelcase */
test('case statement has loc', t => {
	const cmd =
`case foo in
	* )
		echo bar;;
esac
`;
	const result = bashParser(cmd, {insertLOC: true});

	// console.log(json.stringify(result.and_ors[0].left.commands[0], null, '\t').replace(/"/g, '\''));
	const expected = {
		type: 'case',
		loc: {
			startLine: 0,
			startColumn: 0,
			endLine: 3,
			endColumn: 3
		},
		clause: {
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
				loc: {
					startLine: 1,
					startColumn: 1,
					endLine: 2,
					endColumn: 11
				},
				pattern: [
					{
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
					type: 'term',
					and_ors: [
						{
							type: 'and_or',
							left: {
								type: 'pipeline',
								commands: [
									{
										type: 'simple_command',
										name: {
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
										suffix: {
											type: 'cmd_suffix',
											list: [
												{
													text: 'bar',
													loc: {
														startLine: 2,
														startColumn: 7,
														endLine: 2,
														endColumn: 9
													}
												}
											]
										}
									}
								]
							},
							loc: {
								startLine: 2,
								startColumn: 2,
								endLine: 2,
								endColumn: 9
							}
						}
					],
					loc: {
						startLine: 2,
						startColumn: 2,
						endLine: 2,
						endColumn: 9
					}
				}
			}
		]
	};
	// console.log(json.stringify(diff(expected.cases, result.and_ors[0].left.commands[0].cases), null, 4));

	t.deepEqual(result.and_ors[0].left.commands[0], expected);
});
