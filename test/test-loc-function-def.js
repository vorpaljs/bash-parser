'use strict';
const test = require('ava');
const bashParser = require('../src');

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
			text: 'foo',
			loc: {
				startLine: 0,
				startColumn: 0,
				endLine: 0,
				endColumn: 2
			}
		},
		body: {
			type: 'term',
			loc: {
				startLine: 0,
				startColumn: 7,
				endLine: 2,
				endColumn: 0
			},
			andOrs: [
				{
					type: 'andOr',
					left: [
						{
							type: 'simple_command',
							name: {
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
							suffix: {
								type: 'cmd_suffix',
								list: [
									{
										text: 'bar',
										loc: {
											startLine: 1,
											startColumn: 9,
											endLine: 1,
											endColumn: 11
										}
									},
									{
										text: '--lol',
										loc: {
											startLine: 1,
											startColumn: 13,
											endLine: 1,
											endColumn: 17
										}
									}
								]
							}
						}
					],
					loc: {
						startLine: 1,
						startColumn: 1,
						endLine: 1,
						endColumn: 17
					}
				}
			]

		}
	};

	t.deepEqual(result.andOrs[0].left[0], expected);
});
