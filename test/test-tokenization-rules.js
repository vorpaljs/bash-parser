'use strict';

const test = require('ava');
const rules = require('../src/modes/posix/rules');
const utils = require('../src/utils');
// const _utils = require('./_utils');

const token = utils.tokens.token;

function check(t, rule, actual, expected) {
	// _utils.logResults({actual: Array.from(rule({}, utils)(actual)), expected});
	t.is(
		JSON.stringify(
			Array.from(rule({}, utils)(actual))
		),
		JSON.stringify(expected)
	);
}

test('operatorTokens - identify operator with their tokens', t => {
	check(t, rules.operatorTokens,
		[token({type: 'OPERATOR', value: '<<', loc: 42})],
		[token({type: 'DLESS', value: '<<', loc: 42})]
	);
});

test('reservedWords - identify reserved words or WORD', t => {
	check(
		t,
		rules.reservedWords, [
			token({type: 'TOKEN', value: 'while', loc: 42}),
			token({type: 'TOKEN', value: 'otherWord', loc: 42})
		], [
			token({type: 'While', value: 'while', loc: 42}),
			token({type: 'WORD', value: 'otherWord', loc: 42})
		]
	);
});

test('functionName - replace function name token as NAME', t => {
	const input = [
		token({type: 'WORD', value: 'test', loc: 42, _: {maybeStartOfSimpleCommand: true}}),
		token({type: 'OPEN_PAREN', value: '(', loc: 42}),
		token({type: 'CLOSE_PAREN', value: ')', loc: 42}),
		token({type: 'Lbrace', value: '{', loc: 42}),
		token({type: 'WORD', value: 'body', loc: 42}),
		token({type: 'WORD', value: 'foo', loc: 42}),
		token({type: 'WORD', value: '--lol', loc: 42}),
		token({type: ';', value: ';', loc: 42}),
		token({type: 'Rbrace', value: '}', loc: 42})
	];
	// _utils.logResults(result);

	check(t, rules.functionName, input,
		[
			token({type: 'NAME', value: 'test', loc: 42, _: {maybeStartOfSimpleCommand: true}}),
			token({type: 'OPEN_PAREN', value: '(', loc: 42}),
			token({type: 'CLOSE_PAREN', value: ')', loc: 42}),
			token({type: 'Lbrace', value: '{', loc: 42}),
			token({type: 'WORD', value: 'body', loc: 42}),
			token({type: 'WORD', value: 'foo', loc: 42}),
			token({type: 'WORD', value: '--lol', loc: 42}),
			token({type: ';', value: ';', loc: 42}),
			token({type: 'Rbrace', value: '}', loc: 42})
		]
	);
});
