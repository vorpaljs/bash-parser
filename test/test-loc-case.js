'use strict';
const test = require('ava');
// const json = require('json5');
// const {diff} = require('rus-diff');
const bashParser = require('../src');

test('case statement has loc', t => {
	const cmd =
`case foo in
	* )
		echo bar;;
esac
`;
	const result = bashParser(cmd, {insertLOC: true});

	// console.log(json.stringify(result.andOrs[0].left[0], null, '\t').replace(/"/g, '\''));
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
				type: 'pattern',
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
					andOrs: [
						{
							type: 'andOr',
							left: [
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
				}
			}
		]
	};
	// console.log(json.stringify(diff(expected.cases, result.andOrs[0].left[0].cases), null, 4));

	t.deepEqual(result.andOrs[0].left[0], expected);
});
