'use strict';
import 'babel-register';

const test = require('ava');
const posixLexer = require('../src/shell-lexer');
const posixMode = require('../src/modes/posix');
const utils = require('./_utils');

/* eslint-disable camelcase */
function tokenize(text, rawTokens) {
	const lexer = posixLexer(posixMode.init(), {});
	lexer.setInput(text);
	const results = [];
	let token = lexer.lex();
	while (token !== 'EOF') {
		delete token.type;

		if (rawTokens) {
			const value = JSON.parse(JSON.stringify(lexer.yytext));
			delete value.type;
			delete value.maybeSimpleCommandName;

			results.push({token, value});
		} else {
			const value = lexer.yytext.text || lexer.yytext;
			const expansion = lexer.expansion;
			delete value.type;
			delete value.maybeSimpleCommandName;

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
	utils.checkResults(t, result,
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
					type: 'parameter_expansion',
					parameter: 'other',
					loc: {
						start: 4,
						end: 11
					}
				}]
			}
		}]);

	t.is(result[1].value.text.slice(
		result[1].value.expansion[0].loc.start,
		result[1].value.expansion[0].loc.end + 1
	), '${other}');
});

test('parses unquoted parameter substitution', t => {
	const result = tokenize('echo word$test', true);
	// utils.logResults(result)
	utils.checkResults(t, result,
		[{token: 'WORD', value: {text: 'echo'}},
		{
			token: 'WORD',
			value: {
				text: 'word$test',
				expansion: [{
					type: 'parameter_expansion',
					parameter: 'test',
					loc: {start: 4, end: 8}
				}]
			}
		}]
	);

	t.is(result[1].value.text.slice(
		result[1].value.expansion[0].loc.start,
		result[1].value.expansion[0].loc.end + 1
	), '$test');
});

test('unquoted parameter delimited by symbol', t => {
	const result = tokenize('echo word$test,,', true);
	// utils.logResults(result);
	utils.checkResults(t, result,
		[{token: 'WORD', value: {text: 'echo'}},
		{
			token: 'WORD',
			value: {
				text: 'word$test,,',
				expansion: [{
					type: 'parameter_expansion', parameter: 'test',
					loc: {start: 4, end: 8}
				}]
			}
		}]
	);

	t.is(result[1].value.text.slice(
		result[1].value.expansion[0].loc.start,
		result[1].value.expansion[0].loc.end + 1
	), '$test');
});

test('parse single operator', t => {
	utils.checkResults(t,
		tokenize('<<'),
		[{token: 'DLESS', value: '<<'}]
	);
});

test('parse redirections', t => {
	utils.checkResults(t,
		tokenize('echo>ciao'),
		[{token: 'WORD', value: 'echo'},
		{token: 'GREAT', value: '>'},
		{token: 'WORD', value: 'ciao'}]
	);
});

test('parse io-number redirections', t => {
	utils.checkResults(t,
		tokenize('echo 2> ciao'),
		[{token: 'WORD', value: 'echo'},
		{token: 'IO_NUMBER', value: '2'},
		{token: 'GREAT', value: '>'},
		{token: 'WORD', value: 'ciao'}]
	);
});

test('parse two operators on two lines', t => {
	utils.checkResults(t,
		tokenize('<<\n>>'),
		[{token: 'DLESS', value: '<<'},
		{token: 'NEWLINE_LIST', value: '\n'},
		{token: 'DGREAT', value: '>>'}]
	);
});

test('parse two words', t => {
	utils.checkResults(t,
		tokenize('echo 42'),
		[{token: 'WORD', value: 'echo'},
		{token: 'WORD', value: '42'}]
	);
});

test('support character escaping', t => {
	utils.checkResults(t,
		tokenize('echo\\>23'),
		[{token: 'WORD', value: 'echo>23'}]
	);
});

test.skip('support line continuations', t => { // not yet implemented
	// utils.logResults(tokenize('echo\\\n23'))
	utils.checkResults(t,
		tokenize('echo\\\n23'),
		[{token: 'WORD', value: 'echo23'}]
	);
});

test('support single quotes', t => {
	utils.checkResults(t,
		tokenize('echo \'CIAO 42\''),
		[{token: 'WORD', value: 'echo'},
		{token: 'WORD', value: 'CIAO 42'}]
	);
});

test('support &&', t => {
	utils.checkResults(t,
		tokenize('run && stop'),
		[{token: 'WORD', value: 'run'}, {token: 'AND_IF', value: '&&'}, {token: 'WORD', value: 'stop'}]
	);
});

test.skip('support &', t => {
	utils.checkResults(t,
		tokenize('run &'),
		[{token: 'WORD', value: 'run'}, {token: 'SEPARATOR_OP', value: '&'}]
	);
});

test('support ||', t => {
	utils.checkResults(t,
		tokenize('run || stop'),
		[{token: 'WORD', value: 'run'}, {token: 'OR_IF', value: '||'}, {token: 'WORD', value: 'stop'}]
	);
});

test('support for', t => {
	utils.checkResults(t,
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
	utils.checkResults(t,
		tokenize('for x in; do echo x; done'),
		[{token: 'For', value: 'for'}, {token: 'NAME', value: 'x'},
			{token: 'In', value: 'in'},
			{token: 'SEPARATOR_OP', value: ';'}, {token: 'Do', value: 'do'},
			{token: 'WORD', value: 'echo'}, {token: 'WORD', value: 'x'},
			{token: 'SEPARATOR_OP', value: ';'}, {token: 'Done', value: 'done'}]
	);
});

test('support double quotes', t => {
	utils.checkResults(t,
		tokenize('echo "CIAO 42"'),
		[{token: 'WORD', value: 'echo'},
		{token: 'WORD', value: 'CIAO 42'}]
	);
});
test('support multiple commands', t => {
	// utils.logResults(tokenize('echo; \nls;'));

	utils.checkResults(t,
		tokenize('echo; \nls;'),
		[{token: 'WORD', value: 'echo'}, {token: 'SEPARATOR_OP', value: ';\n'},
		{token: 'WORD', value: 'ls'}, {token: 'SEPARATOR_OP', value: ';'}]
	);
});

test('support while', t => {
	utils.checkResults(t,
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
	utils.checkResults(t,
		tokenize('foo () {command}'),
		[{token: 'WORD', value: 'foo'}, {token: 'OPEN_PAREN', value: '('},
		{token: 'CLOSE_PAREN', value: ')'}, {token: 'Lbrace', value: '{'},
		{token: 'WORD', value: 'command'}, {token: 'Rbrace', value: '}'}]
	);
});
*/
