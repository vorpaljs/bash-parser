'use strict';
const test = require('ava');
const rules = require('../src/modes/posix/rules');
const utils = require('../src/utils');
const _utils = require('./_utils');
/* eslint-disable camelcase */

function transform(result) {
	return Array.from(result).map(t => {
		const r = Object.assign({}, t);
		r[r.type] = r.value;
		delete r.type;
		delete r.value;
		return r;
	});
}

test('operatorTokens - identify operator with their tokens', t => {
	const is = type => type === 'OPERATOR';
	_utils.checkResults(t,
		transform(rules.operatorTokens({}, utils)([{OPERATOR: '<<', value: '<<', type: 'OPERATOR', loc: 42, is}])),
		[{DLESS: '<<', loc: 42, _: {}}]
	);
});

test('reservedWords - identify reserved words or WORD', t => {
	const is = type => type === 'TOKEN';
	const result = transform(rules.reservedWords({}, utils)([
		{TOKEN: 'while', value: 'while', loc: 42, is},
		{TOKEN: 'otherWord', value: 'otherWord', loc: 42, is}
	]));
	// console.log(result)
	_utils.checkResults(t,
		result,
		[{While: 'while', loc: 42, _: {}}, {WORD: 'otherWord', loc: 42, _: {}}]
	);
});

test('functionName - replace function name token as NAME', t => {
	function is(type) {
		return Boolean(this[type]);
	}
	const result = transform(rules.functionName({}, utils)([
		{WORD: 'test', value: 'test', loc: 42, _: {maybeStartOfSimpleCommand: true}, is},
		{OPEN_PAREN: '(', loc: 42, _: {}, is},
		{CLOSE_PAREN: ')', loc: 42, _: {}, is},
		{Lbrace: '{', loc: 42, _: {}, is},
		{WORD: 'body', loc: 42, _: {}, is},
		{WORD: 'foo', loc: 42, _: {}, is},
		{WORD: '--lol', loc: 42, _: {}, is},
		{';': ';', 'loc': 42, '_': {}, is},
		{Lbrace: '}', loc: 42, _: {}, is}
	]));
	// _utils.logResults(result);

	_utils.checkResults(t, JSON.parse(JSON.stringify(result)),
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
