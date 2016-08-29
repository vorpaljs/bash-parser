'use strict';
const test = require('ava');
const posixLexer = require('../src/posix-shell-lexer');
/* eslint-disable camelcase */
function tokenize(text, rawTokens) {
	const lexer = posixLexer({});
	lexer.setInput(text);
	const results = [];
	let token = lexer.lex();
	while (token !== 'EOF') {
		if (rawTokens) {
			results.push({token, value: JSON.parse(JSON.stringify(lexer.yytext))});
		} else {
			const value = lexer.yytext.text || lexer.yytext;
			const expansion = lexer.expansion;
			if (expansion) {
				results.push({token, value, expansion});
			} else {
				results.push({token, value});
			}
		}

		token = lexer.lex();
	}
	return results;
}

test('parses parameter substitution', t => {
	const result = tokenize('echo word${other}test', true);
	t.deepEqual(result,
		[{
			token: 'WORD',
			value: {
				text: 'echo'
			}
		}, {
			token: 'WORD',
			value: {
				text: 'word${other}test',
				expansion: [{
					parameter: 'other',
					start: 4,
					end: 12
				}]
			}
		}]);

	t.is(result[1].value.text.slice(
		result[1].value.expansion[0].start,
		result[1].value.expansion[0].end
	), '${other}');
});

test('parses unquoted parameter substitution', t => {
	const result = tokenize('echo word$test', true);
	t.deepEqual(result,
		[{token: 'WORD', value: {text: 'echo'}},
		{
			token: 'WORD',
			value: {
				text: 'word$test',
				expansion: [{parameter: 'test', start: 4, end: 9}]
			}
		}]
	);

	t.is(result[1].value.text.slice(
		result[1].value.expansion[0].start,
		result[1].value.expansion[0].end
	), '$test');
});

test('unquoted parameter delimited by symbol', t => {
	const result = tokenize('echo word$test,,', true);

	t.deepEqual(result,
		[{token: 'WORD', value: {text: 'echo'}},
		{
			token: 'WORD',
			value: {
				text: 'word$test,,',
				expansion: [{parameter: 'test', start: 4, end: 9}]
			}
		}]
	);

	t.is(result[1].value.text.slice(
		result[1].value.expansion[0].start,
		result[1].value.expansion[0].end
	), '$test');
});

test('parse single operator', t => {
	t.deepEqual(
		tokenize('<<'),
		[{token: 'DLESS', value: '<<'}]
	);
});

test('parse redirections', t => {
	t.deepEqual(
		tokenize('echo>ciao'),
		[{token: 'WORD', value: 'echo'},
		{token: 'GREAT', value: '>'},
		{token: 'WORD', value: 'ciao'}]
	);
});

test('parse io-number redirections', t => {
	t.deepEqual(
		tokenize('echo 2> ciao'),
		[{token: 'WORD', value: 'echo'},
		{token: 'IO_NUMBER', value: '2'},
		{token: 'GREAT', value: '>'},
		{token: 'WORD', value: 'ciao'}]
	);
});

test('parse two operators on two lines', t => {
	t.deepEqual(
		tokenize('<<\n>>'),
		[{token: 'DLESS', value: '<<'},
		{token: 'NEWLINE_LIST', value: '\n'},
		{token: 'DGREAT', value: '>>'}]
	);
});

test('parse two words', t => {
	t.deepEqual(
		tokenize('echo 42'),
		[{token: 'WORD', value: 'echo'},
		{token: 'WORD', value: '42'}]
	);
});

test('support character escaping', t => {
	t.deepEqual(
		tokenize('echo\\>23'),
		[{token: 'WORD', value: 'echo>23'}]
	);
});

/* TODO: implement line continuation */
/*
test.skip('support line continuations', t => { // not yet implemented
	t.deepEqual(
		tokenize('echo\\\n23'),
		[{token: 'WORD', value: 'echo23'}]
	);
});
*/

test('support single quotes', t => {
	t.deepEqual(
		tokenize('echo \'CIAO 42\''),
		[{token: 'WORD', value: 'echo'},
		{token: 'WORD', value: '\'CIAO 42\''}]
	);
});

test('support &&', t => {
	t.deepEqual(
		tokenize('run && stop'),
		[{token: 'WORD', value: 'run'}, {token: 'AND_IF', value: '&&'}, {token: 'WORD', value: 'stop'}]
	);
});

test('support &', t => {
	t.deepEqual(
		tokenize('run &'),
		[{token: 'WORD', value: 'run'}, {token: 'SEPARATOR_OP', value: '&'}]
	);
});

test('support ||', t => {
	t.deepEqual(
		tokenize('run || stop'),
		[{token: 'WORD', value: 'run'}, {token: 'OR_IF', value: '||'}, {token: 'WORD', value: 'stop'}]
	);
});

test('support for', t => {
	t.deepEqual(
		tokenize('for x in a b c; do echo x; done'),
		[{token: 'For', value: 'for'}, {token: 'NAME', value: 'x'},
			{token: 'In', value: 'in'}, {token: 'WORD', value: 'a'},
			{token: 'WORD', value: 'b'}, {token: 'WORD', value: 'c'},
			{token: 'SEPARATOR_OP', value: ';'}, {token: 'Do', value: 'do'},
			{token: 'WORD', value: 'echo'}, {token: 'WORD', value: 'x'},
			{token: 'SEPARATOR_OP', value: ';'}, {token: 'Done', value: 'done'}]
	);
});

test('support for with default sequence', t => {
	t.deepEqual(
		tokenize('for x in; do echo x; done'),
		[{token: 'For', value: 'for'}, {token: 'NAME', value: 'x'},
			{token: 'In', value: 'in'},
			{token: 'SEPARATOR_OP', value: ';'}, {token: 'Do', value: 'do'},
			{token: 'WORD', value: 'echo'}, {token: 'WORD', value: 'x'},
			{token: 'SEPARATOR_OP', value: ';'}, {token: 'Done', value: 'done'}]
	);
});

test('support double quotes', t => {
	t.deepEqual(
		tokenize('echo "CIAO 42"'),
		[{token: 'WORD', value: 'echo'},
		{token: 'WORD', value: '"CIAO 42"'}]
	);
});
test('support multiple commands', t => {
	t.deepEqual(
		tokenize('echo; \nls;'),
		[{token: 'WORD', value: 'echo'}, {token: 'SEPARATOR_OP', value: ';\n'},
		{token: 'WORD', value: 'ls'}, {token: 'SEPARATOR_OP', value: ';'}]
	);
});

test('support while', t => {
	t.deepEqual(
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
	t.deepEqual(
		tokenize('foo () {command}'),
		[{token: 'WORD', value: 'foo'}, {token: 'OPEN_PAREN', value: '('},
		{token: 'CLOSE_PAREN', value: ')'}, {token: 'Lbrace', value: '{'},
		{token: 'WORD', value: 'command'}, {token: 'Rbrace', value: '}'}]
	);
});
*/
