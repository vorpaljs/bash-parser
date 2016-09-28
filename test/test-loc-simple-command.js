'use strict';
require('babel-register');

// const json = require('json5');
// const {diff} = require('rus-diff');
const test = require('ava');
const bashParser = require('../src');
const mkloc = require('./_utils').mkloc2;
const utils = require('./_utils');

/* eslint-disable camelcase */
test('simple command with prefixes and name', t => {
	const result = bashParser('a=1 b=2 echo', {insertLOC: true});
	utils.checkResults(t, result.commands[0], {
		type: 'simple_command',
		name: {
			type: 'word',
			text: 'echo',
			loc: mkloc(1, 9, 1, 12, 8, 11)
		},
		loc: mkloc(1, 1, 1, 12, 0, 11),
		prefix: [{
			type: 'assignment_word',
			text: 'a=1',
			loc: mkloc(1, 1, 1, 3, 0, 2)
		}, {
			type: 'assignment_word',
			text: 'b=2',
			loc: mkloc(1, 5, 1, 7, 4, 6)
		}]
	});
});

test('simple command with only name', t => {
	const result = bashParser('echo', {insertLOC: true});
	utils.checkResults(t, result.commands[0], {
		type: 'simple_command',
		name: {
			type: 'word',
			text: 'echo',
			loc: mkloc(1, 1, 1, 4, 0, 3)
		},
		loc: mkloc(1, 1, 1, 4, 0, 3)
	});
});

test('simple command with pipeline', t => {
	const result = bashParser('echo | grep', {insertLOC: true});
	// console.log(JSON.stringify(result, null, 4));
	utils.checkResults(t, result.commands[0], {
		type: 'pipeline',
		commands: [{
			type: 'simple_command',
			name: {
				type: 'word',
				text: 'echo',
				loc: mkloc(1, 1, 1, 4, 0, 3)
			},
			loc: mkloc(1, 1, 1, 4, 0, 3)
		}, {
			type: 'simple_command',
			name: {
				type: 'word',
				text: 'grep',
				loc: mkloc(1, 8, 1, 11, 7, 10)
			},
			loc: mkloc(1, 8, 1, 11, 7, 10)
		}],
		loc: mkloc(1, 1, 1, 11, 0, 10)
	});
});

test('simple command with suffixes', t => {
	const result = bashParser('echo 42 43', {insertLOC: true});
	utils.checkResults(t, result.commands[0], {
		type: 'simple_command',
		name: {
			type: 'word',
			text: 'echo',
			loc: mkloc(1, 1, 1, 4, 0, 3)
		},
		loc: mkloc(1, 1, 1, 10, 0, 9),
		suffix: [{
			type: 'word',
			text: '42',
			loc: mkloc(1, 6, 1, 7, 5, 6)
		}, {
			type: 'word',
			text: '43',
			loc: mkloc(1, 9, 1, 10, 8, 9)
		}]
	});
});

test('simple command with IO redirection', t => {
	const result = bashParser('echo > 43', {insertLOC: true});
	utils.checkResults(t, result.commands[0], {
		type: 'simple_command',
		name: {
			type: 'word',
			text: 'echo',
			loc: mkloc(1, 1, 1, 4, 0, 3)
		},
		loc: mkloc(1, 1, 1, 9, 0, 8),
		suffix: [{
			type: 'io_redirect',
			op: {
				type: 'great',
				text: '>',
				loc: mkloc(1, 6, 1, 6, 5, 5)
			},
			file: {
				type: 'word',
				text: '43',
				loc: mkloc(1, 8, 1, 9, 7, 8)
			},
			loc: mkloc(1, 6, 1, 9, 5, 8)
		}]
	});
});

test('simple command with numbered IO redirection', t => {
	const result = bashParser('echo 2> 43', {insertLOC: true});
	// utils.logResults(result);
	const expected = {
		type: 'simple_command',
		name: {
			type: 'word',
			text: 'echo',
			loc: mkloc(1, 1, 1, 4, 0, 3)
		},
		loc: mkloc(1, 1, 1, 10, 0, 9),
		suffix: [{
			type: 'io_redirect',
			op: {
				type: 'great',
				text: '>',
				loc: mkloc(1, 7, 1, 7, 6, 6)
			},
			file: {
				type: 'word',
				text: '43',
				loc: mkloc(1, 9, 1, 10, 8, 9)
			},
			loc: mkloc(1, 6, 1, 10, 5, 9),
			numberIo: {
				text: '2',
				type: 'io_number',
				loc: mkloc(1, 6, 1, 6, 5, 5)
			}
		}]
	};
	// console.log(json.stringify(diff(result.commands[0].left.commands[0], expected), null, 4));

	utils.checkResults(t, result.commands[0], expected);
});

test('simple command with suffixes & prefixes', t => {
	const result = bashParser('a=1 b=2 echo 42 43', {insertLOC: true});
	utils.checkResults(t, result.commands[0], {
		type: 'simple_command',
		name: {
			type: 'word',
			text: 'echo',
			loc: mkloc(1, 9, 1, 12, 8, 11)
		},
		loc: mkloc(1, 1, 1, 18, 0, 17),
		prefix: [{
			type: 'assignment_word',
			text: 'a=1',
			loc: mkloc(1, 1, 1, 3, 0, 2)
		}, {
			type: 'assignment_word',
			text: 'b=2',
			loc: mkloc(1, 5, 1, 7, 4, 6)
		}],
		suffix: [{
			type: 'word',
			text: '42',
			loc: mkloc(1, 14, 1, 15, 13, 14)
		}, {
			type: 'word',
			text: '43',
			loc: mkloc(1, 17, 1, 18, 16, 17)
		}]
	});
});
