'use strict';
const test = require('ava');
const rules = require('../src/tokenization-rules');

test('operatorTokens - identify operator with their tokens', t => {
	t.deepEqual(
		Array.from(rules.operatorTokens([{OPERATOR: '<<'}])),
		[{DLESS: '<<'}]
	);
});

test('reservedWords - identify reserved words or WORD', t => {
	t.deepEqual(
		Array.from(rules.reservedWords([{TOKEN: 'while'}, {TOKEN: 'otherWord'}])),
		[{While: 'while'}, {WORD: 'otherWord'}]
	);
});

test('functionName - replace function name token as NAME', t => {
	t.deepEqual(
		Array.from(rules.functionName([
			{WORD: 'test'},
			{OPEN_PAREN: '('},
			{CLOSE_PAREN: ')'},
			{Lbrace: '{'},
			{WORD: 'body'},
			{WORD: 'foo'},
			{WORD: '--lol'},
			{';': ';'},
			{Lbrace: '}'}
		])),
		[
			{NAME: 'test'},
			{OPEN_PAREN: '('},
			{CLOSE_PAREN: ')'},
			{Lbrace: '{'},
			{WORD: 'body'},
			{WORD: 'foo'},
			{WORD: '--lol'},
			{';': ';'},
			{Lbrace: '}'}
		]
	);
});
