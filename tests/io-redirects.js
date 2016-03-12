var test = require('tape');
var parse = require('../parser');

test('redirecting I/O', function (t) {
	var cmd = parse('transform < fromfile > tofile', 'command');

	t.deepEqual(cmd, {
		type: 'command',
		command: {type: 'literal', value: 'transform'},
		args: [],
		redirects: [
			{type: 'redirectFd',
				fd: 0,
				op: '<',
				filename: {type: 'literal', value: 'fromfile'}},
			{type: 'redirectFd',
				fd: 1,
				op: '>',
				filename: {type: 'literal', value: 'tofile'}}
		],
		env: {},
		control: ';',
		next: null
	}, "can redirect stdin and stdout in same command");

	t.deepEqual(parse('cmd 6> /dev/null', 'command'), {
		type: 'command',
		command: {type: 'literal', value: 'cmd'},
		args: [],
		redirects: [
			{type: 'redirectFd',
				fd: 6,
				op: '>',
				filename: {type: 'literal', value: '/dev/null'}}
		],
		env: {},
		control: ';',
		next: null
	}, "can redirect arbitrary fd's");

	t.deepEqual(parse("> /dev/null cmd", 'command'), {
		type: 'command',
		command: {type: 'literal', value: 'cmd'},
		args: [],
		redirects: [
			{type: 'redirectFd',
				fd: 1,
				op: '>',
				filename: {type: 'literal', value: '/dev/null'}}
		],
		env: {},
		control: ';',
		next: null
	}, 'Can start commands with redirects');

	t.deepEqual(parse('cmd 2>&1 >/dev/null', 'command'), {
		type: 'command',
		command: {type: 'literal', value: 'cmd'},
		args: [],
		redirects: [
			{type: 'duplicateFd',
				srcFd: 2,
				op: '>&',
				destFd: 1},
			{type: 'redirectFd',
				fd: 1,
				op: '>',
				filename: {type: 'literal', value: '/dev/null'}}
		],
		env: {},
		control: ';',
		next: null
	});
	t.end();
});
