'use strict';
import 'babel-register';
// const json = require('json5');
// const {diff} = require('rus-diff');
const test = require('ava');
const bashParser = require('../src');
const mkloc = require('./_utils').mkloc;
const utils = require('./_utils');

/* eslint-disable camelcase */
test('simple command with prefixes and name', t => {
	const result = bashParser('a=1 b=2 echo', {insertLOC: true});
	utils.checkResults(t, result.commands[0], {
		type: 'simple_command',
		name: {
			type: 'word',
			text: 'echo',
			loc: mkloc(0, 8, 0, 11)
		},
		loc: mkloc(0, 0, 0, 11),
		prefix: [{
			type: 'assignment_word',
			text: 'a=1',
			loc: mkloc(0, 0, 0, 2)
		}, {
			type: 'assignment_word',
			text: 'b=2',
			loc: mkloc(0, 4, 0, 6)
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
			loc: mkloc(0, 0, 0, 3)
		},
		loc: mkloc(0, 0, 0, 3)
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
				loc: mkloc(0, 0, 0, 3)
			},
			loc: mkloc(0, 0, 0, 3)
		}, {
			type: 'simple_command',
			name: {
				type: 'word',
				text: 'grep',
				loc: mkloc(0, 7, 0, 10)
			},
			loc: mkloc(0, 7, 0, 10)
		}],
		loc: mkloc(0, 0, 0, 10)
	});
});

test('simple command with suffixes', t => {
	const result = bashParser('echo 42 43', {insertLOC: true});
	utils.checkResults(t, result.commands[0], {
		type: 'simple_command',
		name: {
			type: 'word',
			text: 'echo',
			loc: mkloc(0, 0, 0, 3)
		},
		loc: mkloc(0, 0, 0, 9),
		suffix: [{
			type: 'word',
			text: '42',
			loc: mkloc(0, 5, 0, 6)
		}, {
			type: 'word',
			text: '43',
			loc: mkloc(0, 8, 0, 9)
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
			loc: mkloc(0, 0, 0, 3)
		},
		loc: mkloc(0, 0, 0, 8),
		suffix: [{
			type: 'io_redirect',
			op: {
				type: 'great',
				text: '>',
				loc: mkloc(0, 5, 0, 5)
			},
			file: {
				type: 'word',
				text: '43',
				loc: mkloc(0, 7, 0, 8)
			},
			loc: mkloc(0, 5, 0, 8)
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
			loc: mkloc(0, 0, 0, 3)
		},
		loc: mkloc(0, 0, 0, 9),
		suffix: [{
			type: 'io_redirect',
			op: {
				type: 'great',
				text: '>',
				loc: mkloc(0, 6, 0, 6)
			},
			file: {
				type: 'word',
				text: '43',
				loc: mkloc(0, 8, 0, 9)
			},
			loc: mkloc(0, 5, 0, 9),
			numberIo: {
				text: '2',
				type: 'io_number',
				loc: mkloc(0, 5, 0, 5)
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
			loc: mkloc(0, 8, 0, 11)
		},
		loc: mkloc(0, 0, 0, 17),
		prefix: [{
			type: 'assignment_word',
			text: 'a=1',
			loc: mkloc(0, 0, 0, 2)
		}, {
			type: 'assignment_word',
			text: 'b=2',
			loc: mkloc(0, 4, 0, 6)
		}],
		suffix: [{
			type: 'word',
			text: '42',
			loc: mkloc(0, 13, 0, 14)
		}, {
			type: 'word',
			text: '43',
			loc: mkloc(0, 16, 0, 17)
		}]
	});
});
