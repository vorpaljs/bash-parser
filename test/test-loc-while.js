'use strict';
const test = require('ava');
const bashParser = require('../src');
// const json = require('json5');
// const {diff} = require('rus-diff');
/* eslint-disable camelcase */
test('loc in while statement', t => {
	const result = bashParser('while true && 1; do sleep 1;echo ciao; done', {insertLOC: true});
	const expected = {
		type: 'while',
		loc: {
			startLine: 0,
			startColumn: 0,
			endLine: 0,
			endColumn: 42
		},
		clause: {
			loc: {
				startLine: 0,
				startColumn: 6,
				endLine: 0,
				endColumn: 14
			},
			type: 'term',
			and_ors: [
				{
					type: 'and_or',
					op: 'and',
					loc: {
						startLine: 0,
						startColumn: 6,
						endLine: 0,
						endColumn: 14
					},
					left: {
						type: 'and_or',
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
						type: 'and_or',
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
				startColumn: 17,
				endLine: 0,
				endColumn: 42
			},
			and_ors: [
				{
					type: 'and_or',
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
					type: 'and_or',
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
	// console.log(json.stringify(diff(expected, result.and_ors[0].left[0]), null, '\t').replace(/"/g, '\''));

	t.deepEqual(result.and_ors[0].left[0], expected);
});
