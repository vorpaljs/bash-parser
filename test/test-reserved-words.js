'use strict';
const test = require('ava');
const bashParser = require('../src');
const utils = require('./_utils');

test('single quoted tokens are not parsed as reserved words', t => {
	const result = bashParser('\'if\' true');
	// utils.logResults(result);

	utils.checkResults(t, result, {
		type: 'complete_command',
		commands: [
			{
				type: 'simple_command',
				name: {
					text: 'if',
					type: 'word'
				},
				suffix: [
					{
						text: 'true',
						type: 'word'
					}
				]
			}
		]
	});
});

test('double quoted tokens are not parsed as reserved words', t => {
	const result = bashParser('"if" true');
	// utils.logResults(result);

	utils.checkResults(t, result, {
		type: 'complete_command',
		commands: [
			{
				type: 'simple_command',
				name: {
					text: 'if',
					type: 'word'
				},
				suffix: [
					{
						text: 'true',
						type: 'word'
					}
				]
			}
		]
	});
});

test('partially double quoted tokens are not parsed as reserved words', t => {
	const result = bashParser('i"f" true');
	// utils.logResults(result);

	utils.checkResults(t, result, {
		type: 'complete_command',
		commands: [
			{
				type: 'simple_command',
				name: {
					text: 'if',
					type: 'word'
				},
				suffix: [
					{
						text: 'true',
						type: 'word'
					}
				]
			}
		]
	});
});

test('partially single quoted tokens are not parsed as reserved words', t => {
	const result = bashParser('i\'f\' true');
	// utils.logResults(result);

	utils.checkResults(t, result, {
		type: 'complete_command',
		commands: [
			{
				type: 'simple_command',
				name: {
					text: 'if',
					type: 'word'
				},
				suffix: [
					{
						text: 'true',
						type: 'word'
					}
				]
			}
		]
	});
});

test('tokens in invalid positions are not parsed as reserved words', t => {
	const result = bashParser('echo if');
	// utils.logResults(result);

	utils.checkResults(t, result, {
		type: 'complete_command',
		commands: [
			{
				type: 'simple_command',
				name: {
					text: 'echo',
					type: 'word'
				},
				suffix: [
					{
						text: 'if',
						type: 'word'
					}
				]
			}
		]
	});
});
