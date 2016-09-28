'use strict';

const test = require('ava');
const bashParser = require('../src');
const utils = require('./_utils');

/* eslint-disable camelcase */
test('positional parameter with word following', t => {
	const result = bashParser('echoword=$1ciao')
		.commands[0].prefix;

	// utils.logResults(result);

	utils.checkResults(t, result, [{
		type: 'assignment_word',
		text: 'echoword=$1ciao',
		expansion: [{
			type: 'parameter_expansion',
			kind: 'positional',
			parameter: 1,
			loc: {
				start: 9,
				end: 10
			}
		}]
	}]);
});

test('positional parameter in braces', t => {
	const result = bashParser('echoword=${11}test');
	utils.checkResults(t, result, {
		type: 'complete_command',
		commands: [
			{
				type: 'simple_command',
				name: {type: 'word', text: ''},
				prefix: [{
					type: 'assignment_word',
					text: 'echoword=${11}test',
					expansion: [{
						type: 'parameter_expansion',
						parameter: 11,
						kind: 'positional',
						loc: {
							start: 9,
							end: 13
						}
					}]
				}]
			}
		]
	});
});

test('positional parameter without braces', t => {
	const result = bashParser('echoword=$1');
	// console.log(JSON.stringify(result, null, 5))
	utils.checkResults(t, result, {
		type: 'complete_command',
		commands: [{
			type: 'simple_command',
			name: {type: 'word', text: ''},
			prefix: [{
				type: 'assignment_word',
				text: 'echoword=$1',
				expansion: [{
					type: 'parameter_expansion',
					parameter: 1,
					kind: 'positional',
					loc: {
						start: 9,
						end: 10
					}
				}]
			}]
		}]
	});
});

test('positional parameter without braces allow one digit only', t => {
	const result = bashParser('echoword=$11');
	// console.log(JSON.stringify(result, null, 5))
	utils.checkResults(t, result, {
		type: 'complete_command',
		commands: [{
			type: 'simple_command',
			name: {type: 'word', text: ''},
			prefix: [{
				type: 'assignment_word',
				text: 'echoword=$11',
				expansion: [{
					type: 'parameter_expansion',
					parameter: 1,
					kind: 'positional',
					loc: {
						start: 9,
						end: 10
					}
				}]
			}]
		}]
	});
});
