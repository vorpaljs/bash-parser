'use strict';
/* eslint-disable camelcase */
const test = require('ava');
const bashParser = require('../src');
// const inspect = require('util').inspect;

test('command with one argument', t => {
	const result = bashParser('echo world');
	t.deepEqual(result, {
		type: 'list',
		and_ors: [{
			type: 'and_or',
			left: [{
				type: 'simple_command',
				name: {text: 'echo'},
				suffix: {
					type: 'cmd_suffix',
					list: [
						{text: 'world'}
					]
				}
			}]
		}]
	});
});

test('command with pre-assignment', t => {
	const result = bashParser('TEST=1 run');
	t.deepEqual(result, {
		type: 'list',
		and_ors: [{
			type: 'and_or',
			left: [{
				type: 'simple_command',
				name: {text: 'run'},
				prefix: {
					type: 'cmd_prefix',
					list: [{text: 'TEST=1'}]
				}
			}]
		}]
	});
});

test('commands with AND', t => {
	const result = bashParser('run && stop');
	t.deepEqual(result, {
		type: 'list',
		and_ors: [{
			type: 'and_or',
			op: 'and',
			left: {
				type: 'and_or',
				left: [{type: 'simple_command', name: {text: 'run'}}]
			},
			right: {
				type: 'and_or',
				left: [{type: 'simple_command', name: {text: 'stop'}}]
			}
		}]
	});
});

test('commands with AND \\n', t => {
	const result = bashParser('run && \n stop');
	// console.log(inspect(result, {depth: null}))
	t.deepEqual(result, {
		type: 'list',
		and_ors: [{
			type: 'and_or',
			op: 'and',
			left: {
				type: 'and_or',
				left: [{type: 'simple_command', name: {text: 'run'}}]
			},
			right: {
				type: 'and_or',
				left: [{type: 'simple_command', name: {text: 'stop'}}]
			}
		}]
	});
});

test('commands with OR', t => {
	const result = bashParser('run || cry');
	t.deepEqual(result, {
		type: 'list',
		and_ors: [{
			type: 'and_or',
			op: 'or',
			left: {
				type: 'and_or',
				left: [{type: 'simple_command', name: {text: 'run'}}]
			},
			right: {
				type: 'and_or',
				left: [{type: 'simple_command', name: {text: 'cry'}}]
			}
		}]
	});
});

test('pipelines', t => {
	const result = bashParser('run | cry');
	// console.log(inspect(result, {depth: null}));
	t.deepEqual(result, {
		type: 'list',
		and_ors: [{
			type: 'and_or',
			left: [{
				type: 'simple_command', name: {text: 'run'}
			}, {
				type: 'simple_command', name: {text: 'cry'}
			}]
		}]
	});
});

test('no pre-assignment on suffix', t => {
	const result = bashParser('echo TEST=1');
	t.deepEqual(result, {
		type: 'list',
		and_ors: [{
			type: 'and_or',
			left: [{
				type: 'simple_command',
				name: {text: 'echo'},
				suffix: {
					type: 'cmd_suffix',
					list: [{text: 'TEST=1'}]
				}
			}]
		}]
	});
});

test('command with multiple prefixes', t => {
	const result = bashParser('TEST1=1 TEST2=2 echo world');
	// console.log(inspect(result, {depth:null}))
	t.deepEqual(result, {
		type: 'list',
		and_ors: [{
			type: 'and_or',
			left: [{
				type: 'simple_command',
				name: {text: 'echo'},
				prefix: {type: 'cmd_prefix', list: [{text: 'TEST1=1'}, {text: 'TEST2=2'}]},
				suffix: {
					type: 'cmd_suffix',
					list: [{text: 'world'}]
				}
			}]
		}]
	});
});

test('multi line commands', t => {
	const result = bashParser('echo; \nls;\n');
	// console.log(inspect(result, {depth:null}))
	t.deepEqual(result, {
		type: 'list',
		and_ors: [{
			type: 'and_or',
			left: [{
				type: 'simple_command',
				name: {text: 'echo'}
			}]
		}, {
			type: 'and_or',
			left: [{
				type: 'simple_command',
				name: {text: 'ls'}
			}]
		}]
	});
});

test('command with redirection to file', t => {
	const result = bashParser('ls > file.txt');
	t.deepEqual(result, {
		type: 'list',
		and_ors: [{
			type: 'and_or',
			left: [{
				type: 'simple_command',
				name: {text: 'ls'},
				suffix: {
					type: 'cmd_suffix',
					list: [
						{
							type: 'io_redirect',
							op: {text: '>'},
							file: {text: 'file.txt'}
						}
					]
				}
			}]
		}]
	});
});

test('parse multiple suffix', t => {
	const result = bashParser('command foo --lol');
	t.deepEqual(
		result, {
			type: 'list',
			and_ors: [{
				type: 'and_or',
				left:
				[{
					type: 'simple_command',
					name: {text: 'command'},
					suffix: {
						type: 'cmd_suffix',
						list: [{text: 'foo'}, {text: '--lol'}]
					}
				}]
			}]
		}
	);
});

test('command with stderr redirection to file', t => {
	const result = bashParser('ls 2> file.txt');

	t.deepEqual(result, {
		type: 'list',
		and_ors: [{
			type: 'and_or',
			left: [{
				type: 'simple_command',
				name: {text: 'ls'},
				suffix: {
					type: 'cmd_suffix',
					list: [{
						type: 'io_redirect',
						op: {text: '>'},
						file: {text: 'file.txt'},
						numberIo: {text: '2'}
					}]
				}
			}]
		}]
	});
});

test('parse subshell', t => {
	const result = bashParser('( ls )');
	// console.log(inspect(result, {depth:null}))
	t.deepEqual(
		result, {
			type: 'list',
			and_ors: [{
				type: 'and_or',
				left: [{
					type: 'subshell',
					list: {
						type: 'term',
						and_ors: [{
							type: 'and_or',
							left: [{
								type: 'simple_command',
								name: {text: 'ls'}
							}]
						}]
					}
				}]
			}]
		}
	);
});
