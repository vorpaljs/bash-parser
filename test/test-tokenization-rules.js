'use strict';
const test = require('ava');
const rules = require('../src/tokenization-rules');

test('operatorTokens - identify operator with their tokens', t => {
	t.deepEqual(
		Array.from(rules.operatorTokens([{OPERATOR: '<<', loc: 42}])),
		[{DLESS: '<<', loc: 42}]
	);
});

test('reservedWords - identify reserved words or WORD', t => {
	t.deepEqual(
		Array.from(rules.reservedWords([
			{TOKEN: 'while', loc: 42},
			{TOKEN: 'otherWord', loc: 42}
		])),
		[{While: 'while', loc: 42}, {WORD: 'otherWord', loc: 42}]
	);
});

test('functionName - replace function name token as NAME', t => {
	t.deepEqual(
		Array.from(rules.functionName([
			{WORD: 'test', loc: 42},
			{OPEN_PAREN: '(', loc: 42},
			{CLOSE_PAREN: ')', loc: 42},
			{Lbrace: '{', loc: 42},
			{WORD: 'body', loc: 42},
			{WORD: 'foo', loc: 42},
			{WORD: '--lol', loc: 42},
			{';': ';', 'loc': 42},
			{Lbrace: '}', loc: 42}
		])),
		[
			{NAME: 'test', loc: 42},
			{OPEN_PAREN: '(', loc: 42},
			{CLOSE_PAREN: ')', loc: 42},
			{Lbrace: '{', loc: 42},
			{WORD: 'body', loc: 42},
			{WORD: 'foo', loc: 42},
			{WORD: '--lol', loc: 42},
			{';': ';', 'loc': 42},
			{Lbrace: '}', loc: 42}
		]
	);
});
