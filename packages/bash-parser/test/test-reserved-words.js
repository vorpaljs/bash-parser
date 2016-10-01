'use strict';

const test = require('ava');
const bashParser = require('../src');
const utils = require('./_utils');

test('single quoted tokens are not parsed as reserved words', t => {
	const result = bashParser('\'if\' true');
	// utils.logResults(result);

	utils.checkResults(t, result, {
		type: 'Script',
		commands: [
			{
				type: 'Command',
				name: {
					text: 'if',
					type: 'Word'
				},
				suffix: [
					{
						text: 'true',
						type: 'Word'
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
		type: 'Script',
		commands: [
			{
				type: 'Command',
				name: {
					text: 'if',
					type: 'Word'
				},
				suffix: [
					{
						text: 'true',
						type: 'Word'
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
		type: 'Script',
		commands: [
			{
				type: 'Command',
				name: {
					text: 'if',
					type: 'Word'
				},
				suffix: [
					{
						text: 'true',
						type: 'Word'
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
		type: 'Script',
		commands: [
			{
				type: 'Command',
				name: {
					text: 'if',
					type: 'Word'
				},
				suffix: [
					{
						text: 'true',
						type: 'Word'
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
		type: 'Script',
		commands: [
			{
				type: 'Command',
				name: {
					text: 'echo',
					type: 'Word'
				},
				suffix: [
					{
						text: 'if',
						type: 'Word'
					}
				]
			}
		]
	});
});
