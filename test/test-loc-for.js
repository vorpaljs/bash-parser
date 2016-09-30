'use strict';

const test = require('ava');
const bashParser = require('../src');
const utils = require('./_utils');

/* eslint-disable camelcase */
test('loc in for statement', t => {
	const cmd =
`for x in a b c; do
	echo $x;
done
`;
	const result = bashParser(cmd, {insertLOC: true});
	const expected = {
		type: 'For',
		name: {
			text: 'x',
			type: 'Name',
			loc: {
				start: {
					col: 5,
					row: 1,
					char: 4
				},
				end: {
					col: 5,
					row: 1,
					char: 4
				}
			}
		},
		wordlist: [
			{
				text: 'a',
				type: 'Word',
				loc: {
					start: {
						col: 10,
						row: 1,
						char: 9
					},
					end: {
						col: 10,
						row: 1,
						char: 9
					}
				}
			},
			{
				text: 'b',
				type: 'Word',
				loc: {
					start: {
						col: 12,
						row: 1,
						char: 11
					},
					end: {
						col: 12,
						row: 1,
						char: 11
					}
				}
			},
			{
				text: 'c',
				type: 'Word',
				loc: {
					start: {
						col: 14,
						row: 1,
						char: 13
					},
					end: {
						col: 14,
						row: 1,
						char: 13
					}
				}
			}
		],
		do: {
			type: 'CompoundList',
			commands: [
				{
					type: 'Command',
					name: {
						text: 'echo',
						type: 'Word',
						loc: {
							start: {
								col: 2,
								row: 2,
								char: 20
							},
							end: {
								col: 5,
								row: 2,
								char: 23
							}
						}
					},
					loc: {
						start: {
							col: 2,
							row: 2,
							char: 20
						},
						end: {
							col: 8,
							row: 2,
							char: 26
						}
					},
					suffix: [
						{
							text: '$x',
							expansion: [
								{
									loc: {
										start: 0,
										end: 1
									},
									parameter: 'x',
									type: 'ParameterExpansion'
								}
							],
							type: 'Word',
							loc: {
								start: {
									col: 7,
									row: 2,
									char: 25
								},
								end: {
									col: 8,
									row: 2,
									char: 26
								}
							}
						}
					]
				}
			],
			loc: {
				start: {
					col: 17,
					row: 1,
					char: 16
				},
				end: {
					col: 4,
					row: 3,
					char: 32
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
				col: 4,
				row: 3,
				char: 32
			}
		}
	};

	utils.checkResults(t, result.commands[0], expected);
});

test('loc in default for statement', t => {
	const cmd =
`for x do
	echo $x;
done
`;
	const result = bashParser(cmd, {insertLOC: true});
	// utils.logResults(result.commands[0])
	const expected = {
		type: 'For',
		name: {
			text: 'x',
			type: 'Name',
			loc: {
				start: {
					col: 5,
					row: 1,
					char: 4
				},
				end: {
					col: 5,
					row: 1,
					char: 4
				}
			}
		},
		do: {
			type: 'CompoundList',
			commands: [
				{
					type: 'Command',
					name: {
						text: 'echo',
						type: 'Word',
						loc: {
							start: {
								col: 2,
								row: 2,
								char: 10
							},
							end: {
								col: 5,
								row: 2,
								char: 13
							}
						}
					},
					loc: {
						start: {
							col: 2,
							row: 2,
							char: 10
						},
						end: {
							col: 8,
							row: 2,
							char: 16
						}
					},
					suffix: [
						{
							text: '$x',
							expansion: [
								{
									loc: {
										start: 0,
										end: 1
									},
									parameter: 'x',
									type: 'ParameterExpansion'
								}
							],
							type: 'Word',
							loc: {
								start: {
									col: 7,
									row: 2,
									char: 15
								},
								end: {
									col: 8,
									row: 2,
									char: 16
								}
							}
						}
					]
				}
			],
			loc: {
				start: {
					col: 7,
					row: 1,
					char: 6
				},
				end: {
					col: 4,
					row: 3,
					char: 22
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
				col: 4,
				row: 3,
				char: 22
			}
		}
	};

	utils.checkResults(t, result.commands[0], expected);
});
