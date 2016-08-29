'use strict';
// const json = require('json5');
// const {diff} = require('rus-diff');
const test = require('ava');
const bashParser = require('../src');

test('simple command with prefixes and name', t => {
	const result = bashParser('a=1 b=2 echo', {insertLOC: true});
	t.deepEqual(result.andOrs[0].left[0], {
		type: 'simple_command',
		name: {
			text: 'echo',
			loc: {
				startLine: 0,
				startColumn: 8,
				endLine: 0,
				endColumn: 11
			}
		},
		loc: {
			startLine: 0,
			startColumn: 0,
			endLine: 0,
			endColumn: 11
		},
		prefix: {
			type: 'cmd_prefix',
			list: [
				{
					text: 'a=1',
					loc: {
						startLine: 0,
						startColumn: 0,
						endLine: 0,
						endColumn: 2
					}
				},
				{
					text: 'b=2',
					loc: {
						startLine: 0,
						startColumn: 4,
						endLine: 0,
						endColumn: 6
					}
				}
			]
		}
	});
});

test('simple command with only name', t => {
	const result = bashParser('echo', {insertLOC: true});
	// console.log(JSON.stringify(result, null, 4));
	t.deepEqual(result.andOrs[0].left[0], {
		type: 'simple_command',
		name: {
			text: 'echo',
			loc: {
				startLine: 0,
				startColumn: 0,
				endLine: 0,
				endColumn: 3
			}
		},
		loc: {
			startLine: 0,
			startColumn: 0,
			endLine: 0,
			endColumn: 3
		}
	});
});

test('simple command with suffixes', t => {
	const result = bashParser('echo 42 43', {insertLOC: true});
	t.deepEqual(result.andOrs[0].left[0], {
		type: 'simple_command',
		name: {
			text: 'echo',
			loc: {
				startLine: 0,
				startColumn: 0,
				endLine: 0,
				endColumn: 3
			}
		},
		loc: {
			startLine: 0,
			startColumn: 0,
			endLine: 0,
			endColumn: 9
		},
		suffix: {
			type: 'cmd_suffix',
			list: [
				{
					text: '42',
					loc: {
						startLine: 0,
						startColumn: 5,
						endLine: 0,
						endColumn: 6
					}
				},
				{
					text: '43',
					loc: {
						startLine: 0,
						startColumn: 8,
						endLine: 0,
						endColumn: 9
					}
				}
			]
		}
	});
});

test('simple command with IO redirection', t => {
	const result = bashParser('echo > 43', {insertLOC: true});

	t.deepEqual(result.andOrs[0].left[0], {
		type: 'simple_command',
		name: {
			text: 'echo',
			loc: {
				startLine: 0,
				startColumn: 0,
				endLine: 0,
				endColumn: 3
			}
		},
		loc: {
			startLine: 0,
			startColumn: 0,
			endLine: 0,
			endColumn: 8
		},
		suffix: {
			type: 'cmd_suffix',
			list: [
				{
					type: 'io_redirect',
					op: {
						text: '>',
						loc: {
							startLine: 0,
							startColumn: 5,
							endLine: 0,
							endColumn: 5
						}
					},
					file: {
						text: '43',
						loc: {
							startLine: 0,
							startColumn: 7,
							endLine: 0,
							endColumn: 8
						}
					},
					loc: {
						startLine: 0,
						startColumn: 5,
						endLine: 0,
						endColumn: 8
					}
				}
			]
		}
	});
});

test('simple command with numbered IO redirection', t => {
	const result = bashParser('echo 2> 43', {insertLOC: true});
	const expected = {
		type: 'simple_command',
		name: {
			text: 'echo',
			loc: {
				startLine: 0,
				startColumn: 0,
				endLine: 0,
				endColumn: 3
			}
		},
		loc: {
			startLine: 0,
			startColumn: 0,
			endLine: 0,
			endColumn: 9
		},
		suffix: {
			type: 'cmd_suffix',
			list: [
				{
					type: 'io_redirect',
					op: {
						text: '>',
						loc: {
							startLine: 0,
							startColumn: 6,
							endLine: 0,
							endColumn: 6
						}
					},
					file: {
						text: '43',
						loc: {
							startLine: 0,
							startColumn: 8,
							endLine: 0,
							endColumn: 9
						}
					},
					loc: {
						startLine: 0,
						startColumn: 5,
						endLine: 0,
						endColumn: 9
					},
					numberIo: {
						text: '2',
						loc: {
							startLine: 0,
							startColumn: 5,
							endLine: 0,
							endColumn: 5
						}
					}
				}
			]
		}
	};
	// console.log(json.stringify(diff(result.andOrs[0].left[0], expected), null, 4));

	t.deepEqual(result.andOrs[0].left[0], expected);
});

test('simple command with suffixes & prefixes', t => {
	const result = bashParser('a=1 b=2 echo 42 43', {insertLOC: true});
	t.deepEqual(result.andOrs[0].left[0], {
		type: 'simple_command',
		name: {
			text: 'echo',
			loc: {
				startLine: 0,
				startColumn: 8,
				endLine: 0,
				endColumn: 11
			}
		},
		loc: {
			startLine: 0,
			startColumn: 0,
			endLine: 0,
			endColumn: 17
		},
		prefix: {
			type: 'cmd_prefix',
			list: [
				{
					text: 'a=1',
					loc: {
						startLine: 0,
						startColumn: 0,
						endLine: 0,
						endColumn: 2
					}
				},
				{
					text: 'b=2',
					loc: {
						startLine: 0,
						startColumn: 4,
						endLine: 0,
						endColumn: 6
					}
				}
			]
		},
		suffix: {
			type: 'cmd_suffix',
			list: [
				{
					text: '42',
					loc: {
						startLine: 0,
						startColumn: 13,
						endLine: 0,
						endColumn: 14
					}
				},
				{
					text: '43',
					loc: {
						startLine: 0,
						startColumn: 16,
						endLine: 0,
						endColumn: 17
					}
				}
			]
		}
	});
});
