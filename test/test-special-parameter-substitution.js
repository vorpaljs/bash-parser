'use strict';
const test = require('ava');
const bashParser = require('../src');
// const utils = require('./_utils');

/* eslint-disable camelcase */
test('parameter with use default value', t => {
	const result = bashParser('${other:-default_value}');
	t.deepEqual(result.commands[0].name, {
		type: 'word',
		text: '${other:-default_value}',
		expansion: [{
			type: 'parameter_expansion',
			parameter: 'other',
			word: {
				text: 'default_value'
			},
			op: 'useDefaultValue',
			start: 0,
			end: 23
		}]
	});
});

test('parameter with assign default value', t => {
	const result = bashParser('${other:=default_value}');
	t.deepEqual(result.commands[0].name, {
		type: 'word',
		text: '${other:=default_value}',
		expansion: [{
			type: 'parameter_expansion',
			parameter: 'other',
			word: {
				text: 'default_value'
			},
			op: 'assignDefaultValue',
			start: 0,
			end: 23
		}]
	});
});

test('parameter with other parameter in word', t => {
	const result = bashParser('${other:=default$value}');
	t.deepEqual(result.commands[0].name, {
		type: 'word',
		text: '${other:=default$value}',
		expansion: [{
			type: 'parameter_expansion',
			parameter: 'other',
			word: {
				text: 'default$value',
				expansion: [{
					type: 'parameter_expansion',
					parameter: 'value',
					start: 7,
					end: 13
				}]
			},
			op: 'assignDefaultValue',
			start: 0,
			end: 23
		}]
	});
});

test('parameter with indicate error if null', t => {
	const result = bashParser('${other:?default_value}');
	t.deepEqual(result.commands[0].name, {
		text: '${other:?default_value}',
		type: 'word',
		expansion: [{
			type: 'parameter_expansion',
			parameter: 'other',
			word: {
				text: 'default_value'
			},
			op: 'indicateErrorIfNull',
			start: 0,
			end: 23
		}]
	});
});

test('parameter with use alternative value', t => {
	const result = bashParser('${other:+default_value}');
	t.deepEqual(result.commands[0].name, {
		text: '${other:+default_value}',
		type: 'word',
		expansion: [{
			type: 'parameter_expansion',
			parameter: 'other',
			word: {
				text: 'default_value'
			},
			op: 'useAlternativeValue',
			start: 0,
			end: 23
		}]
	});
});

