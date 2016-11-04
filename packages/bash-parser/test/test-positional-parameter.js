'use strict';

const test = require('ava');
const bashParser = require('../index');
const utils = require('./_utils');

test('positional parameter with word following', t => {
	const result = bashParser('echoword=$1ciao')
		.commands[0].prefix;

	// utils.logResults(result);

	utils.checkResults(t, result, [{
		type: 'AssignmentWord',
		text: 'echoword=$1ciao',
		expansion: [{
			type: 'ParameterExpansion',
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
		type: 'Script',
		commands: [
			{
				type: 'Command',
				prefix: [{
					type: 'AssignmentWord',
					text: 'echoword=${11}test',
					expansion: [{
						type: 'ParameterExpansion',
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
		type: 'Script',
		commands: [{
			type: 'Command',
			prefix: [{
				type: 'AssignmentWord',
				text: 'echoword=$1',
				expansion: [{
					type: 'ParameterExpansion',
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
		type: 'Script',
		commands: [{
			type: 'Command',
			prefix: [{
				type: 'AssignmentWord',
				text: 'echoword=$11',
				expansion: [{
					type: 'ParameterExpansion',
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
