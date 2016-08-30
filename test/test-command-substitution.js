'use strict';
const test = require('ava');
const bashParser = require('../src');
// const utils = require('./_utils');

/* eslint-disable camelcase */
test('command substitution', t => {
	const result = bashParser('variable=$(echo ciao)');
	delete result.commands[0].prefix[0].expansion[0].commandAST;
	t.deepEqual(result, {
		type: 'complete_command',
		commands: [
			{
				type: 'simple_command',
				name: {text: ''},
				prefix: [{
					text: 'variable=$(echo ciao)',
					expansion: [{
						command: 'echo ciao',
						kind: 'command',
						start: 9,
						end: 21
					}]
				}]
			}
		]
	});
});

test('command substitution in suffix', t => {
	const result = bashParser('echo $(ciao)');
	delete result.commands[0].suffix[0].expansion[0].commandAST;
	t.deepEqual(result, {
		type: 'complete_command',
		commands: [
			{
				type: 'simple_command',
				name: {text: 'echo'},
				suffix: [{
					text: '$(ciao)',
					expansion: [{
						command: 'ciao',
						kind: 'command',
						start: 0,
						end: 7
					}]
				}]
			}
		]
	});
});

test('command substitution in suffix with backticks', t => {
	const result = bashParser('echo `ciao`');
	delete result.commands[0].suffix[0].expansion[0].commandAST;

	t.deepEqual(result, {
		type: 'complete_command',
		commands: [
			{
				type: 'simple_command',
				name: {text: 'echo'},
				suffix: [{
					text: '`ciao`',
					expansion: [{
						command: 'ciao',
						kind: 'command',
						start: 0,
						end: 6
					}]
				}]
			}
		]
	});
});

test('command ast is recursively parsed', t => {
	const result = bashParser('variable=$(echo ciao)')
		.commands[0].prefix[0].expansion[0].commandAST;

	t.deepEqual(result, {
		type: 'complete_command',
		commands: [
			{
				type: 'simple_command',
				name: {text: 'echo'},
				suffix: [{text: 'ciao'}]
			}
		]
	});
});

test('command substitution with backticks', t => {
	const result = bashParser('variable=`echo ciao`');
	delete result.commands[0].prefix[0].expansion[0].commandAST;

	t.deepEqual(result, {
		type: 'complete_command',
		commands: [
			{
				type: 'simple_command',
				name: {text: ''},
				prefix: [{
					text: 'variable=`echo ciao`',
					expansion: [{
						command: 'echo ciao',
						kind: 'command',
						start: 9,
						end: 20
					}]
				}]
			}
		]
	});
});

test('quoted backtick are removed within command substitution with backticks', t => {
	const result = bashParser('variable=`echo \\`echo ciao\\``');
	delete result.commands[0].prefix[0].expansion[0].commandAST;

	t.deepEqual(result, {
		type: 'complete_command',
		commands: [
			{
				type: 'simple_command',
				name: {text: ''},
				prefix: [{
					text: 'variable=`echo \\`echo ciao\\``',
					expansion: [{
						command: 'echo `echo ciao`',
						kind: 'command',
						start: 9,
						end: 29
					}]
				}]
			}
		]
	});
});

test('quoted backtick are not removed within command substitution with parenthesis', t => {
	const result = bashParser('variable=$(echo \\`echo ciao\\`)');
	delete result.commands[0].prefix[0].expansion[0].commandAST;

	t.deepEqual(result, {
		type: 'complete_command',
		commands: [
			{
				type: 'simple_command',
				name: {text: ''},
				prefix: [{
					text: 'variable=$(echo \\`echo ciao\\`)',
					expansion: [{
						command: 'echo \\`echo ciao\\`',
						kind: 'command',
						start: 9,
						end: 30
					}]
				}]
			}
		]
	});
});
