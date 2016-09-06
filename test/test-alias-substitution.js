'use strict';
/* eslint-disable camelcase */
const test = require('ava');
const bashParser = require('../src');
// const utils = require('./_utils');

test('alias with no argument', t => {
	const result = bashParser('thisIsAlias world', {
		resolveAlias: name => name === 'thisIsAlias' ? 'test-value' : null
	});
	t.deepEqual(result, {
		type: 'complete_command',
		commands: [{
			type: 'simple_command',
			name: {type: 'word', text: 'test-value'},
			suffix: [{type: 'word', text: 'world'}]
		}]
	});
});

test('alias with prefixes', t => {
	const result = bashParser('2>&1 world', {
		resolveAlias: name => name === 'world' ? 'test-value' : null
	});
	t.deepEqual(
		result.commands[0].name,
		{type: 'word', text: 'test-value'}
	);
});

test('alias with arguments', t => {
	const result = bashParser('thisIsAlias world', {
		resolveAlias: name => name === 'thisIsAlias' ? 'test-value earth' : undefined
	});
	t.deepEqual(result, {
		type: 'complete_command',
		commands: [{
			type: 'simple_command',
			name: {type: 'word', text: 'test-value'},
			suffix: [
				{type: 'word', text: 'earth'},
				{type: 'word', text: 'world'}
			]
		}]
	});
});

test('alias with prefixes', t => {
	const result = bashParser('thisIsAlias world', {
		resolveAlias: name => name === 'thisIsAlias' ? 'a=42 test-value' : undefined
	});
	t.deepEqual(result, {
		type: 'complete_command',
		commands: [{
			prefix: [{type: 'assignment_word', text: 'a=42'}],
			type: 'simple_command',
			name: {type: 'word', text: 'test-value'},
			suffix: [{type: 'word', text: 'world'}]
		}]
	});
});

test('recursive alias with prefixes', t => {
	const result = bashParser('thisIsAlias world', {
		resolveAlias: name => {
			if (name === 'thisIsAlias') {
				return 'a=42 recurse';
			}
			if (name === 'recurse') {
				return 'echo other';
			}
		}
	});
	// utils.logResults(result)

	t.deepEqual(result, {
		type: 'complete_command',
		commands: [{
			prefix: [{type: 'assignment_word', text: 'a=42'}],
			type: 'simple_command',
			name: {type: 'word', text: 'echo'},
			suffix: [
				{type: 'word', text: 'other'},
				{type: 'word', text: 'world'}
			]
		}]
	});
});

test('guarded against infinite loops', t => {
	const result = bashParser('thisIsAlias world', {
		resolveAlias: name => {
			if (name === 'thisIsAlias') {
				return 'alias1';
			}
			if (name === 'alias1') {
				return 'alias2';
			}
			if (name === 'alias2') {
				return 'thisIsAlias ciao';
			}
		}
	});
	// utils.logResults(result)

	t.deepEqual(result, {
		type: 'complete_command',
		commands: [{
			type: 'simple_command',
			name: {type: 'word', text: 'thisIsAlias'},
			suffix: [
				{type: 'word', text: 'ciao'},
				{type: 'word', text: 'world'}
			]
		}]
	});
});
