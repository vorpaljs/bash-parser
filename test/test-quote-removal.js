'use strict';
const test = require('ava');
const bashParser = require('../src');
// const utils = require('./_utils');

/* eslint-disable camelcase */
test('remove double quote from string', t => {
	const result = bashParser('"echo"');
	t.deepEqual(result.commands[0].name, {
		type: 'word',
		text: 'echo'
	});
});

test('remove single quotes from string', t => {
	const result = bashParser('\'echo\'');
	t.deepEqual(result.commands[0].name, {
		type: 'word',
		text: 'echo'
	});
});

test('remove slashes from string', t => {
	const result = bashParser('ec\\%ho');
	t.deepEqual(result.commands[0].name, {
		type: 'word',
		text: 'ec%ho'
	});
});

test('not remove quotes from middle of string if escaped', t => {
	const result = bashParser('ec\\\'\\"ho');

	t.deepEqual(result.commands[0].name, {
		type: 'word',
		text: 'ec\'"ho'
	});
});

test('remove quotes from middle of string', t => {
	const result = bashParser('ec\'h\'o');
	// utils.logResults(result)
	t.deepEqual(result.commands[0].name, {
		type: 'word',
		text: 'echo'
	});
});
