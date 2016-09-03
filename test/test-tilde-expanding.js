'use strict';
const test = require('ava');
const bashParser = require('../src');
// const utils = require('./_utils');

/* eslint-disable camelcase */
test('resolve tilde to current user home', t => {
	const result = bashParser('echo ~/subdir', {
		resolveHomeUser() {
			return '/home/current';
		}
	});
	// utils.logResults(result);
	t.deepEqual(result, {
		type: 'complete_command',
		commands: [
			{
				type: 'simple_command',
				name: {type: 'word', text: 'echo'},
				suffix: [{
					type: 'word',
					text: '/home/current/subdir'
				}]
			}
		]
	});
});

test('resolve one tilde only in normal WORD tokens', t => {
	const result = bashParser('echo ~/subdir/~other/', {
		resolveHomeUser() {
			return '/home/current';
		}
	});

	t.deepEqual(result, {
		type: 'complete_command',
		commands: [
			{
				type: 'simple_command',
				name: {type: 'word', text: 'echo'},
				suffix: [{
					type: 'word',
					text: '/home/current/subdir/~other/'
				}]
			}
		]
	});
});

test('resolve multiple tilde in assignments', t => {
	const result = bashParser('a=~/subdir:~/othersubdir/ciao', {
		resolveHomeUser() {
			return '/home/current';
		}
	});
	// utils.logResults(result.commands[0].prefix[0]);
	t.deepEqual(result.commands[0].prefix[0], {
		type: 'assignment_word',
		text: 'a=/home/current/subdir:/home/current/othersubdir/ciao'
	});
});

test('resolve tilde to any user home', t => {
	const result = bashParser('echo ~username/subdir', {
		resolveHomeUser() {
			return '/home/username';
		}
	});

	t.deepEqual(result, {
		type: 'complete_command',
		commands: [
			{
				type: 'simple_command',
				name: {type: 'word', text: 'echo'},
				suffix: [{
					type: 'word',
					text: '/home/username/subdir'
				}]
			}
		]
	});
});
