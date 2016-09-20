'use strict';
const test = require('ava');
const rules = require('../src/modes/posix/rules');
const utils = require('../src/utils');
/* eslint-disable camelcase */

function transform(result) {
	return Array.from(result).map(t => {
		const r = Object.assign({}, t);
		delete r.type;
		delete r.value;
		return r;
	});
}

test('operatorTokens - identify operator with their tokens', t => {
	t.deepEqual(
		transform(rules.operatorTokens({}, utils)([{OPERATOR: '<<', loc: 42}])),
		[{DLESS: '<<', loc: 42}]
	);
});

test('reservedWords - identify reserved words or WORD', t => {
	t.deepEqual(
		transform(rules.reservedWords({}, utils)([
			{TOKEN: 'while', loc: 42},
			{TOKEN: 'otherWord', loc: 42}
		])),
		[{While: 'while', loc: 42, _: undefined}, {WORD: 'otherWord', loc: 42, _: undefined}]
	);
});

test('functionName - replace function name token as NAME', t => {
	const result = transform(rules.functionName({}, utils)([
		{WORD: 'test', loc: 42, _: {maybeStartOfSimpleCommand: true}},
		{OPEN_PAREN: '(', loc: 42, _: {}},
		{CLOSE_PAREN: ')', loc: 42, _: {}},
		{Lbrace: '{', loc: 42, _: {}},
		{WORD: 'body', loc: 42, _: {}},
		{WORD: 'foo', loc: 42, _: {}},
		{WORD: '--lol', loc: 42, _: {}},
		{';': ';', 'loc': 42, '_': {}},
		{Lbrace: '}', loc: 42, _: {}}
	]));
	t.deepEqual(result,
		[
			{NAME: 'test', loc: 42, _: {maybeStartOfSimpleCommand: true}},
			{OPEN_PAREN: '(', loc: 42, _: {}},
			{CLOSE_PAREN: ')', loc: 42, _: {}},
			{Lbrace: '{', loc: 42, _: {}},
			{WORD: 'body', loc: 42, _: {}},
			{WORD: 'foo', loc: 42, _: {}},
			{WORD: '--lol', loc: 42, _: {}},
			{';': ';', 'loc': 42, '_': {}},
			{Lbrace: '}', loc: 42, _: {}}
		]
	);
});
