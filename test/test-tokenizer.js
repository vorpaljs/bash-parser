'use strict';
import 'babel-register';
import test from 'ava';
import tokenDelimiter from '../src/modes/posix/tokenizer';
import utils from './_utils';

const tokenizer = tokenDelimiter();

function mkloc([startCol, startRow, startChar], [endCol, endRow, endChar]) {
	return JSON.stringify({
		start: {
			col: startCol,
			row: startRow,
			char: startChar
		},
		end: {
			col: endCol,
			row: endRow,
			char: endChar
		}
	});
}

function tokenize(text, keepLoc) {
	const results = Array.from(tokenizer(text)).map(t => {
		const r = Object.assign({}, t);
		r[r.type] = r.value;
		delete r._;
		delete r.type;
		delete r.value;
		if (keepLoc && r.loc) {
			r.loc = JSON.stringify(r.loc);
		} else {
			delete r.loc;
		}
		return r;
	});
	return results;
}

test('parse single operator', t => {
	const result = tokenize('<<');
	t.deepEqual(
		result, [
			{DLESS: '<<'},
			{EOF: ''}
		]
	);
});

test('parse word', t => {
	const result = tokenize('abc');
	t.deepEqual(
		result, [
			{TOKEN: 'abc'},
			{EOF: ''}
		]
	);
});

test('parse word followed by newline', t => {
	const result = tokenize('abc\n');
	t.deepEqual(
		result, [
			{TOKEN: 'abc'},
			{NEWLINE: '\n'},
			{EOF: ''}
		]
	);
});

test('parse invalid operator', t => {
	const result = tokenize('&');
	t.deepEqual(
		result, [
			{TOKEN: '&'},
			{EOF: ''}
		]
	);
});

test('emit EOF at end', t => {
	t.deepEqual(
		tokenize(''),
		[{EOF: ''}]
	);
});

test('parse new lines', t => {
	t.deepEqual(
		tokenize('\n'), [
			{NEWLINE: '\n'},
			{EOF: ''}
		]
	);
});

test('operator breaks words', t => {
	t.deepEqual(
		tokenize('e<'), [
			{TOKEN: 'e'},
			{LESS: '<'},
			{EOF: ''}
		]
	);
});

test('double breaks', t => {
	t.deepEqual(
		tokenize('echo>ciao'), [
			{TOKEN: 'echo'},
			{GREAT: '>'},
			{TOKEN: 'ciao'},
			{EOF: ''}
		]
	);
});

test('word breaks operators', t => {
	t.deepEqual(
		tokenize('<e'), [
			{LESS: '<'},
			{TOKEN: 'e'},
			{EOF: ''}
		]
	);
});

test('parse two operators on two lines', t => {
	t.deepEqual(
		tokenize('<<\n>>'), [
			{DLESS: '<<'},
			{NEWLINE: '\n'},
			{DGREAT: '>>'},
			{EOF: ''}
		]
	);
});

test('parse two operators on one line', t => {
	t.deepEqual(
		tokenize('<< >>'), [
			{DLESS: '<<'},
			{DGREAT: '>>'},
			{EOF: ''}
		]
	);
});

test('parse two tokens', t => {
	t.deepEqual(
		tokenize('echo 42'), [
			{TOKEN: 'echo'},
			{TOKEN: '42'},
			{EOF: ''}
		]
	);
});

test('parse two tokens on two lines', t => {
	t.deepEqual(
		tokenize('echo\n42'), [
			{TOKEN: 'echo'},
			{NEWLINE: '\n'},
			{TOKEN: '42'},
			{EOF: ''}
		]
	);
});

test('keep multiple newlines', t => {
	const result = tokenize('echo\n\n\n42');
	t.deepEqual(
		result, [
			{TOKEN: 'echo'},
			{NEWLINE: '\n'},
			{NEWLINE: '\n'},
			{NEWLINE: '\n'},
			{TOKEN: '42'},
			{EOF: ''}
		]
	);
});

test('support escaping chars', t => {
	t.deepEqual(
		tokenize('echo\\<'), [
			{TOKEN: 'echo\\<'},
			{EOF: ''}
		]
	);
});

test('character escaping is resetted on each char', t => {
	t.deepEqual(
		tokenize('echo\\<<'), [
			{TOKEN: 'echo\\<'},
			{LESS: '<'},
			{EOF: ''}
		]
	);
});

test('support quoting with single', t => {
	const result = tokenize('echo \'< world >\' other');

	t.deepEqual(
		result, [
			{TOKEN: 'echo'},
			{TOKEN: '\'< world >\''},
			{TOKEN: 'other'},
			{EOF: ''}
		]
	);
});

test('in single quote escaping single quotes is not working', t => {
	const result = tokenize('\'\\\'\'');

	t.deepEqual(
		result, [
			{TOKEN: '\'\\\'\''},
			{CONTINUE: '\''}
		]
	);
});

test('single quote does not break words', t => {
	const result = tokenize('a\'b\'c');

	t.deepEqual(
		result, [
			{TOKEN: 'a\'b\'c'},
			{EOF: ''}
		]
	);
});

test('support quoting with double', t => {
	t.deepEqual(
		tokenize('echo "< world >" other'), [
			{TOKEN: 'echo'},
			{TOKEN: '"< world >"'},
			{TOKEN: 'other'},
			{EOF: ''}
		]
	);
});

test('escaped double quotes within double quotes', t => {
	const result = tokenize('echo "TEST1 \\"TEST2" ucci ucci');
	t.deepEqual(
		result, [
			{TOKEN: 'echo'},
			{TOKEN: '"TEST1 \\"TEST2"'},
			{TOKEN: 'ucci'},
			{TOKEN: 'ucci'},
			{EOF: ''}
		]
	);
});

test('escaped escape double quotes within double quotes', t => {
	const result = tokenize('echo "TEST1 \\\\" TEST2 " u i"');
	t.deepEqual(
		result, [
			{TOKEN: 'echo'},
			{TOKEN: '"TEST1 \\\\"'},
			{TOKEN: 'TEST2'},
			{TOKEN: '" u i"'},
			{EOF: ''}
		]
	);
});

test('parse loc', t => {
	const result = tokenize('abc', true);
	t.deepEqual(
		result, [
			{TOKEN: 'abc', loc: mkloc([1, 1, 0], [3, 1, 2])},
			{EOF: ''}
		]
	);
});

test('reset start loc on each token', t => {
	const result = tokenize('abc def', true);
	t.deepEqual(
		result, [
			{TOKEN: 'abc', loc: mkloc([1, 1, 0], [3, 1, 2])},
			{TOKEN: 'def', loc: mkloc([5, 1, 4], [7, 1, 6])},
			{EOF: ''}
		]
	);
});

test('loc on operators', t => {
	const result = tokenize('< <<', true);
	// console.log(JSON.stringify(result, null, 4))
	t.deepEqual(
		result, [
			{LESS: '<', loc: mkloc([1, 1, 0], [1, 1, 0])},
			{DLESS: '<<', loc: mkloc([3, 1, 2], [4, 1, 3])},
			{EOF: ''}
		]
	);
});

test('loc on newlines', t => {
	const result = tokenize('<\n<<', true);
	t.deepEqual(
		result, [
			{LESS: '<', loc: mkloc([1, 1, 0], [1, 1, 0])},
			{NEWLINE: '\n'},
			{DLESS: '<<', loc: mkloc([1, 2, 2], [2, 2, 3])},
			{EOF: ''}
		]
	);
});

test('loc on line continuations', t => {
	const result = tokenize('a\\\nbc', true);

	t.deepEqual(
		result, [
			{TOKEN: 'a\\\nbc', loc: mkloc([1, 1, 0], [2, 2, 4])},
			{EOF: ''}
		]
	);
});

test('parse parameter expansion', t => {
	const result = tokenize('a$b-c');
	// utils.logResults(result);

	const expansion = [{
		type: 'parameter_expansion',
		loc: {start: 1, end: 2},
		parameter: 'b'
	}];

	t.deepEqual(
		result, [
			{TOKEN: 'a$b-c', expansion},
			{EOF: ''}
		]
	);
});

test('parse special parameter expansion', t => {
	const result = tokenize('a$@cd');
	const expansion = [{
		type: 'parameter_expansion',
		loc: {start: 1, end: 2},
		parameter: '@'
	}];
	t.deepEqual(
		result, [
			{TOKEN: 'a$@cd', expansion},
			{EOF: ''}
		]
	);
});

test('parse extended parameter expansion', t => {
	const result = tokenize('a${b}cd');
	const expansion = [{
		type: 'parameter_expansion',
		loc: {start: 1, end: 4},
		parameter: 'b'
	}];
	t.deepEqual(
		result, [
			{TOKEN: 'a${b}cd', expansion},
			{EOF: ''}
		]
	);
});

test('parse command expansion', t => {
	const result = tokenize('a$(b)cd');
	const expansion = [{
		type: 'command_expansion',
		loc: {start: 1, end: 4},
		command: 'b'
	}];
	t.deepEqual(
		result, [
			{TOKEN: 'a$(b)cd', expansion},
			{EOF: ''}
		]
	);
});

test('parse command with backticks', t => {
	const result = tokenize('a`b`cd');
	const expansion = [{
		type: 'command_expansion',
		loc: {start: 1, end: 3},
		command: 'b'
	}];
	t.deepEqual(
		result, [
			{TOKEN: 'a`b`cd', expansion},
			{EOF: ''}
		]
	);
});

test('parse arithmetic expansion', t => {
	const result = tokenize('a$((b))cd');
	const expansion = [{
		type: 'arithmetic_expansion',
		loc: {start: 1, end: 6},
		expression: 'b'
	}];
	// console.log(JSON.stringify(result, null, 4));
	t.deepEqual(
		result, [
			{TOKEN: 'a$((b))cd', expansion},
			{EOF: ''}
		]
	);
});

test('within double quotes parse parameter expansion', t => {
	const result = tokenize('"a$b-c"');
	const expansion = [{
		type: 'parameter_expansion',
		loc: {start: 2, end: 3},
		parameter: 'b'
	}];

	t.deepEqual(
		result, [
			{TOKEN: '"a$b-c"', expansion},
			{EOF: ''}
		]
	);
});

test('within double quotes parse special parameter expansion', t => {
	const result = tokenize('"a$@cd"');
	const expansion = [{
		type: 'parameter_expansion',
		loc: {start: 2, end: 3},
		parameter: '@'
	}];
	t.deepEqual(
		result, [
			{TOKEN: '"a$@cd"', expansion},
			{EOF: ''}
		]
	);
});

test('within double quotes parse extended parameter expansion', t => {
	const result = tokenize('"a${b}cd"');
	const expansion = [{
		type: 'parameter_expansion',
		loc: {start: 2, end: 5},
		parameter: 'b'
	}];
	t.deepEqual(
		result, [
			{TOKEN: '"a${b}cd"', expansion},
			{EOF: ''}
		]
	);
});

test('within double quotes parse command expansion', t => {
	const result = tokenize('"a$(b)cd"');
	const expansion = [{
		type: 'command_expansion',
		loc: {start: 2, end: 5},
		command: 'b'
	}];
	// console.log(JSON.stringify(result, null, 4))
	t.deepEqual(
		result, [
			{TOKEN: '"a$(b)cd"', expansion},
			{EOF: ''}
		]
	);
});

test('within double quotes parse command with backticks', t => {
	const result = tokenize('"a`b`cd"');
	const expansion = [{
		type: 'command_expansion',
		loc: {start: 2, end: 4},
		command: 'b'
	}];
	// console.log(JSON.stringify(result, null, 4));

	t.deepEqual(
		result, [
			{TOKEN: '"a`b`cd"', expansion},
			{EOF: ''}
		]
	);
});

test('within double quotes parse arithmetic expansion', t => {
	const result = tokenize('"a$((b))cd"');
	const expansion = [{
		type: 'arithmetic_expansion',
		loc: {start: 2, end: 7},
		expression: 'b'
	}];
	t.deepEqual(
		result, [
			{TOKEN: '"a$((b))cd"', expansion},
			{EOF: ''}
		]
	);
});
