'use strict';
const test = require('ava');
const bashParser = require('../src');
// const utils = require('./_utils');
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
					and_ors: [
						{
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
							],
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
	// utils.logResults(result.and_ors[0].commands[0]);

	t.deepEqual(result.and_ors[0].commands[0], expected);
});
