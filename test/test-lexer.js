'use strict';
const test = require('ava');
const posixLexer = require('../src/posix-shell-lexer');
function tokenize(text) {
	const lexer = posixLexer();
	lexer.setInput(text);
	const results = [];
	let token = lexer.lex();
	while (token !== 'EOF') {
		const value = lexer.yytext;
		results.push({token, value});
		token = lexer.lex();
	}
	return results;
}

test('parse single operator', t => {
	t.same(
		tokenize('<<'),
		[{token: 'DLESS', value: '<<'}]
	);
});

test('parse single operator', t => {
	t.same(
		tokenize('<<'),
		[{token: 'DLESS', value: '<<'}]
	);
});
test('parse redirections', t => {
	t.same(
		tokenize('echo>ciao'),
		[{token: 'WORD', value: 'echo'},
		{token: 'GREAT', value: '>'},
		{token: 'WORD', value: 'ciao'}]
	);
});

test('parse io-number redirections', t => {
	t.same(
		tokenize('echo 2> ciao'),
		[{token: 'WORD', value: 'echo'},
		{token: 'IO_NUMBER', value: '2'},
		{token: 'GREAT', value: '>'},
		{token: 'WORD', value: 'ciao'}]
	);
});

test('parse two operators on two lines', t => {
	t.same(
		tokenize('<<\n>>'),
		[{token: 'DLESS', value: '<<'},
		{token: 'NEWLINE_LIST', value: '\n'},
		{token: 'DGREAT', value: '>>'}]
	);
});

test('parse two words', t => {
	t.same(
		tokenize('echo 42'),
		[{token: 'WORD', value: 'echo'},
		{token: 'WORD', value: '42'}]
	);
});

test('support character escaping', t => {
	t.same(
		tokenize('echo\\>23'),
		[{token: 'WORD', value: 'echo>23'}]
	);
});
test.skip('support line continuations', t => { // not yet implemented
	t.same(
		tokenize('echo\\\n23'),
		[{token: 'WORD', value: 'echo23'}]
	);
});

test('support single quotes', t => {
	t.same(
		tokenize('echo \'CIAO 42\''),
		[{token: 'WORD', value: 'echo'},
		{token: 'WORD', value: 'CIAO 42'}]
	);
});

test('support &&', t => {
	t.same(
		tokenize('run && stop'),
		[{token: 'WORD', value: 'run'}, {token: 'AND_IF', value: '&&'}, {token: 'WORD', value: 'stop'}]
	);
});

test('support &', t => {
	t.same(
		tokenize('run &'),
		[{token: 'WORD', value: 'run'}, {token: 'SEPARATOR_OP', value: '&'}]
	);
});

test('support ||', t => {
	t.same(
		tokenize('run || stop'),
		[{token: 'WORD', value: 'run'}, {token: 'OR_IF', value: '||'}, {token: 'WORD', value: 'stop'}]
	);
});

test('support for', t => {
	t.same(
		tokenize('for x in a b c; do echo $x; done'),
		[{token: 'For', value: 'for'}, {token: 'NAME', value: 'x'},
			{token: 'In', value: 'in'}, {token: 'WORD', value: 'a'},
			{token: 'WORD', value: 'b'}, {token: 'WORD', value: 'c'},
			{token: 'SEPARATOR_OP', value: ';'}, {token: 'Do', value: 'do'},
			{token: 'WORD', value: 'echo'}, {token: 'WORD', value: '$x'},
			{token: 'SEPARATOR_OP', value: ';'}, {token: 'Done', value: 'done'}]
	);
});

test('support for with default sequence', t => {
	t.same(
		tokenize('for x in; do echo $x; done'),
		[{token: 'For', value: 'for'}, {token: 'NAME', value: 'x'},
			{token: 'In', value: 'in'},
			{token: 'SEPARATOR_OP', value: ';'}, {token: 'Do', value: 'do'},
			{token: 'WORD', value: 'echo'}, {token: 'WORD', value: '$x'},
			{token: 'SEPARATOR_OP', value: ';'}, {token: 'Done', value: 'done'}]
	);
});

test('support double quotes', t => {
	t.same(
		tokenize('echo "CIAO 42"'),
		[{token: 'WORD', value: 'echo'},
		{token: 'WORD', value: 'CIAO 42'}]
	);
});
test('support multiple commands', t => {
	t.same(
		tokenize('echo; \nls;'),
		[{token: 'WORD', value: 'echo'}, {token: 'SEPARATOR_OP', value: ';\n'},
		{token: 'WORD', value: 'ls'}, {token: 'SEPARATOR_OP', value: ';'}]
	);
});

test('support while', t => {
	t.same(
		tokenize('while [[ -e foo ]]; do sleep 1; done'),
		[{token: 'While', value: 'while'}, {token: 'WORD', value: '[['},
		{token: 'WORD', value: '-e'}, {token: 'WORD', value: 'foo'},
		{token: 'WORD', value: ']]'}, {token: 'SEPARATOR_OP', value: ';'},
		{token: 'Do', value: 'do'}, {token: 'WORD', value: 'sleep'},
		{token: 'WORD', value: '1'}, {token: 'SEPARATOR_OP', value: ';'},
		{token: 'Done', value: 'done'}]
	);
});
/*
test('support function definition', t => {
	t.same(
		tokenize('foo () {command}'),
		[{token: 'WORD', value: 'foo'}, {token: 'OPEN_PAREN', value: '('},
		{token: 'CLOSE_PAREN', value: ')'}, {token: 'Lbrace', value: '{'},
		{token: 'WORD', value: 'command'}, {token: 'Rbrace', value: '}'}]
	);
});
*/
