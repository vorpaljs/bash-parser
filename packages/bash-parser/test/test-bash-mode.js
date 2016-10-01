'use strict';
/* eslint-disable camelcase */

const test = require('ava');
const bashParser = require('../src');
const utils = require('./_utils');

test('alias on reserved word', t => {
	const result = bashParser('if world', {
		mode: 'bash',
		resolveAlias: name => {
			return name === 'if' ? 'echo' : undefined;
		}
	});
	utils.checkResults(t, result, {
		type: 'Script',
		commands: [{
			type: 'Command',
			name: {type: 'Word', text: 'echo'},
			suffix: [{type: 'Word', text: 'world'}]
		}]
	});
});
