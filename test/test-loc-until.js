'use strict';
// const json = require('json5');
const {diff} = require('rus-diff');
const test = require('ava');
const bashParser = require('../src');

test('loc in until statement', t => {
	const result = bashParser('until true && 1; do sleep 1;echo ciao; done', {insertLOC: true});
	// console.log(json.stringify(result.andOrs[0].left[0], null, '\t').replace(/"/g, '\''));
	const expected = {
		type: 'until',
		loc: {
			startLine: 0,
			startColumn: 0,
			endLine: 0,
			endColumn: 36
		},
		clause: {
			loc: {
				startLine: 0,
				startColumn: 6,
				endLine: 0,
				endColumn: 14
			},
			type: 'term',
			andOrs: [
				{
					type: 'andOr',
					op: 'and',
					loc: {
						startLine: 0,
						startColumn: 6,
						endLine: 0,
						endColumn: 14
					},
					left: {
						type: 'andOr',
						loc: {
							startLine: 0,
							startColumn: 6,
							endLine: 0,
							endColumn: 9
						},
						left: [
							{
								type: 'simple_command',
								name: {
									text: 'true',
									loc: {
										startLine: 0,
										startColumn: 6,
										endLine: 0,
										endColumn: 9
									}
								},
								loc: {
									startLine: 0,
									startColumn: 6,
									endLine: 0,
									endColumn: 9
								}
							}
						]
					},
					right: {
						type: 'andOr',
						loc: {
							startLine: 0,
							startColumn: 14,
							endLine: 0,
							endColumn: 14
						},
						left: [
							{
								type: 'simple_command',
								name: {
									text: '1',
									loc: {
										startLine: 0,
										startColumn: 14,
										endLine: 0,
										endColumn: 14
									}
								},
								loc: {
									startLine: 0,
									startColumn: 14,
									endLine: 0,
									endColumn: 14
								}
							}
						]
					}
				}
			]
		},
		do: {
			type: 'term',
			loc: {
				startLine: 0,
				startColumn: 20,
				endLine: 0,
				endColumn: 36
			},
			andOrs: [
				{
					type: 'andOr',
					loc: {
						startLine: 0,
						startColumn: 20,
						endLine: 0,
						endColumn: 26
					},
					left: [
						{
							type: 'simple_command',
							name: {
								text: 'sleep',
								loc: {
									startLine: 0,
									startColumn: 20,
									endLine: 0,
									endColumn: 24
								}
							},
							loc: {
								startLine: 0,
								startColumn: 20,
								endLine: 0,
								endColumn: 26
							},
							suffix: {
								type: 'cmd_suffix',
								list: [
									{
										text: '1',
										loc: {
											startLine: 0,
											startColumn: 26,
											endLine: 0,
											endColumn: 26
										}
									}
								]
							}
						}
					]
				},
				{
					type: 'andOr',
					loc: {
						startLine: 0,
						startColumn: 28,
						endLine: 0,
						endColumn: 36
					},
					left: [
						{
							type: 'simple_command',
							name: {
								text: 'echo',
								loc: {
									startLine: 0,
									startColumn: 28,
									endLine: 0,
									endColumn: 31
								}
							},
							loc: {
								startLine: 0,
								startColumn: 28,
								endLine: 0,
								endColumn: 36
							},
							suffix: {
								type: 'cmd_suffix',
								list: [
									{
										text: 'ciao',
										loc: {
											startLine: 0,
											startColumn: 33,
											endLine: 0,
											endColumn: 36
										}
									}
								]
							}
						}
					]
				}
			]
		}
	};
	console.log(diff(result.andOrs[0].left[0], expected));

	t.deepEqual(result.andOrs[0].left[0], expected);
});
