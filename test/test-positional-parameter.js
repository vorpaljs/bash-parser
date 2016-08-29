'use strict';
const test = require('ava');
const bashParser = require('../src');
// const utils = require('./_utils');

/* eslint-disable camelcase */
test('positional parameter with word following', t => {
	const result = bashParser('echoword=$1ciao')
		.commands[0].prefix;
	// utils.logResults(result);
	//

	t.deepEqual(result, {
		type: 'cmd_prefix',
		list: [{
			text: 'echoword=$1ciao',
			expansion: [{
				kind: 'positional',
				parameter: 1,
				start: 9,
				end: 11
			}]
		}]
	});
});

test('positional parameter in braces', t => {
	const result = bashParser('echoword=${11}test');
	t.deepEqual(result, {
		type: 'complete_command',
		commands: [
			{
				type: 'simple_command',
				name: {text: ''},
				prefix: {
					type: 'cmd_prefix',
					list: [{
						text: 'echoword=${11}test',
						expansion: [{
							parameter: 11,
							kind: 'positional',
							start: 9,
							end: 14
						}]
					}]
				}
			}
		]
	});
});

test('positional parameter without braces', t => {
	const result = bashParser('echoword=$1');
	// console.log(JSON.stringify(result, null, 5))
	t.deepEqual(result, {
		type: 'complete_command',
		commands: [{
			type: 'simple_command',
			name: {text: ''},
			prefix: {
				type: 'cmd_prefix',
				list: [{
					text: 'echoword=$1',
					expansion: [{
						parameter: 1,
						kind: 'positional',
						start: 9,
						end: 11
					}]
				}]
			}
		}]
	});
});

test('positional parameter without braces allow one digit only', t => {
	const result = bashParser('echoword=$11');
	// console.log(JSON.stringify(result, null, 5))
	t.deepEqual(result, {
		type: 'complete_command',
		commands: [{
			type: 'simple_command',
			name: {text: ''},
			prefix: {
				type: 'cmd_prefix',
				list: [{
					text: 'echoword=$11',
					expansion: [{
						parameter: 1,
						kind: 'positional',
						start: 9,
						end: 11
					}]
				}]
			}
		}]
	});
});
