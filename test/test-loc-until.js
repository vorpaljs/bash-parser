'use strict';

const test = require('ava');
const bashParser = require('../src');
// const utils = require('./_utils');

/* eslint-disable camelcase */
test('loc in until statement', t => {
	const result = bashParser('until true && 1; do sleep 1;echo ciao; done', {insertLOC: true});
	// utils.logResults(result.commands[0].left.commands[0]);
	const expected = {
		type: 'until',
		clause: {
			type: 'compound_list',
			commands: [
				{
					type: 'and_or',
					op: 'and',
					left: {
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
					},
					right: {
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
					},
					loc: {
						startLine: 0,
						startColumn: 6,
						endLine: 0,
						endColumn: 14
					}
				}
			],
			loc: {
				startLine: 0,
				startColumn: 6,
				endLine: 0,
				endColumn: 14
			}
		},
		do: {
			type: 'compound_list',
			commands: [
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
				},
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
			],
			loc: {
				startLine: 0,
				startColumn: 17,
				endLine: 0,
				endColumn: 42
			}
		},
		loc: {
			startLine: 0,
			startColumn: 0,
			endLine: 0,
			endColumn: 42
		}
	};

	t.deepEqual(result.commands[0], expected);
});
