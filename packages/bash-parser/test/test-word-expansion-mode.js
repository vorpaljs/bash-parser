'use strict';
/* eslint-disable camelcase */

const test = require('ava');
const bashParser = require('../index');
const utils = require('./_utils');

test('expand on a single word', t => {
	const result = bashParser('ls $var > res.txt', {
		mode: 'word-expansion'
	});
	// utils.logResults(result);
	utils.checkResults(t, result, {
		type: 'Script',
		commands: [{
			type: 'Command',
			name: {
				type: 'Word',
				text: 'ls $var > res.txt',
				expansion: [{
					parameter: 'var',
					loc: {
						start: 3,
						end: 6
					},
					type: 'ParameterExpansion'
				}]
			}
		}]
	});
});
