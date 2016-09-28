'use strict';
require('babel-register');

const test = require('ava');
const bashParser = require('../src');
const utils = require('./_utils');

test('loc take into account line continuations', t => {
	const cmd = 'echo world #this is a comment\necho ciao';
	const result = bashParser(cmd);

	// utils.logResults(result);

	const expected = {
		type: 'complete_command',
		commands: [{
			type: 'simple_command',
			name: {
				type: 'word', text: 'echo'
			},
			suffix: [{
				type: 'word', text: 'world'
			}]
		}, {
			type: 'simple_command',
			name: {
				type: 'word', text: 'echo'
			},
			suffix: [{
				type: 'word', text: 'ciao'
			}]
		}]
	};

	utils.checkResults(t, result, expected);
});

