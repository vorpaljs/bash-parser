'use strict';
const test = require('ava');
const bashParser = require('../src');
const utils = require('./_utils');

/* eslint-disable camelcase */
test('parameter substitution in commands', t => {
	const result = bashParser('echo', {
		resolvePath() {
			return 'ciao';
		}
	});
	utils.checkResults(t, result.commands[0].name, {
		type: 'word',
		text: 'ciao'
	});
});

test('parameter substitution in assignment', t => {
	const result = bashParser('a=echo', {
		resolvePath() {
			return 'ciao';
		}
	});
	utils.checkResults(t, result.commands[0].prefix[0], {
		type: 'assignment_word',
		text: 'a=ciao'
	});
});
