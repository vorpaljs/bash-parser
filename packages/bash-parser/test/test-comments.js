'use strict';

const test = require('ava');
const bashParser = require('../index');
const utils = require('./_utils');

test('loc take into account line continuations', t => {
	const cmd = 'echo world #this is a comment\necho ciao';
	const result = bashParser(cmd);

	// utils.logResults(result);

	const expected = {
		type: 'Script',
		commands: [{
			type: 'Command',
			name: {
				type: 'Word', text: 'echo'
			},
			suffix: [{
				type: 'Word', text: 'world'
			}]
		}, {
			type: 'Command',
			name: {
				type: 'Word', text: 'echo'
			},
			suffix: [{
				type: 'Word', text: 'ciao'
			}]
		}]
	};

	utils.checkResults(t, result, expected);
});

