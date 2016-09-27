'use strict';
import 'babel-register';
const test = require('ava');
const bashParser = require('../src');
const utils = require('./_utils');
/* eslint-disable camelcase */

test('loc in while statement', t => {
	const result = bashParser('while true && 1; do sleep 1;echo ciao; done', {insertLOC: true});
	// utils.logResults(result.commands[0]);
	const expected = {
		type: 'while',
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
							type: 'word',
							loc: {
								start: {
									col: 7,
									row: 1,
									char: 6
								},
								end: {
									col: 10,
									row: 1,
									char: 9
								}
							}
						},
						loc: {
							start: {
								col: 7,
								row: 1,
								char: 6
							},
							end: {
								col: 10,
								row: 1,
								char: 9
							}
						}
					},
					right: {
						type: 'simple_command',
						name: {
							text: '1',
							type: 'word',
							loc: {
								start: {
									col: 15,
									row: 1,
									char: 14
								},
								end: {
									col: 15,
									row: 1,
									char: 14
								}
							}
						},
						loc: {
							start: {
								col: 15,
								row: 1,
								char: 14
							},
							end: {
								col: 15,
								row: 1,
								char: 14
							}
						}
					},
					loc: {
						start: {
							col: 7,
							row: 1,
							char: 6
						},
						end: {
							col: 15,
							row: 1,
							char: 14
						}
					}
				}
			],
			loc: {
				start: {
					col: 7,
					row: 1,
					char: 6
				},
				end: {
					col: 15,
					row: 1,
					char: 14
				}
			}
		},
		do: {
			type: 'compound_list',
			commands: [
				{
					type: 'simple_command',
					name: {
						text: 'sleep',
						type: 'word',
						loc: {
							start: {
								col: 21,
								row: 1,
								char: 20
							},
							end: {
								col: 25,
								row: 1,
								char: 24
							}
						}
					},
					loc: {
						start: {
							col: 21,
							row: 1,
							char: 20
						},
						end: {
							col: 37,
							row: 1,
							char: 36
						}
					},
					suffix: [
						{
							text: '1',
							type: 'word',
							loc: {
								start: {
									col: 27,
									row: 1,
									char: 26
								},
								end: {
									col: 27,
									row: 1,
									char: 26
								}
							}
						},
						{
							text: 'echo',
							type: 'word',
							loc: {
								start: {
									col: 28,
									row: 1,
									char: 27
								},
								end: {
									col: 32,
									row: 1,
									char: 31
								}
							}
						},
						{
							text: 'ciao',
							type: 'word',
							loc: {
								start: {
									col: 34,
									row: 1,
									char: 33
								},
								end: {
									col: 37,
									row: 1,
									char: 36
								}
							}
						}
					]
				}
			],
			loc: {
				start: {
					col: 18,
					row: 1,
					char: 17
				},
				end: {
					col: 43,
					row: 1,
					char: 42
				}
			}
		},
		loc: {
			start: {
				col: 1,
				row: 1,
				char: 0
			},
			end: {
				col: 43,
				row: 1,
				char: 42
			}
		}
	};
	utils.checkResults(t, result.commands[0], expected);
});
