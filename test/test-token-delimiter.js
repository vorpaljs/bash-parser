'use strict';
const test = require('ava');
const tokenDelimiter = require('../src/token-delimiter');
function tokenize(text) {
	const results = Array.from(tokenDelimiter(text));
	return results;
}
test('emit EOF at end', t => {
	t.same(
		tokenize(''),
		[{EOF: true}]
	);
});
test('parse single operator', t => {
	t.same(
		tokenize('<<'),
		[{OPERATOR: '<<'}, {EOF: true}]
	);
});

test('parse two operators on two lines', t => {
	t.same(
		tokenize('<<\n>>'), [
			{OPERATOR: '<<'},
			{NEWLINE: '\n'},
			{OPERATOR: '>>'},
			{EOF: true}
		]
	);
});
test('parse two operators on one line', t => {
	t.same(
		tokenize('<< >>'), [
			{OPERATOR: '<<'},
			{OPERATOR: '>>'},
			{EOF: true}
		]
	);
});

test('parse two tokens', t => {
	t.same(
		tokenize('echo 42'), [
			{TOKEN: 'echo'},
			{TOKEN: '42'},
			{EOF: true}
		]
	);
});

test('parse two tokens on two lines', t => {
	t.same(
		tokenize('echo\n42'), [
			{TOKEN: 'echo'},
			{NEWLINE: '\n'},
			{TOKEN: '42'},
			{EOF: true}
		]
	);
});

test('keep multiple newlines', t => {
	t.same(
		tokenize('echo\n\n\n42'), [
			{TOKEN: 'echo'},
			{NEWLINE: '\n'},
			{NEWLINE: '\n'},
			{NEWLINE: '\n'},
			{TOKEN: '42'},
			{EOF: true}
		]
	);
});

test('operator breaks words', t => {
	t.same(
		tokenize('e<'), [
			{TOKEN: 'e'},
			{OPERATOR: '<'},
			{EOF: true}
		]
	);
});

test('double breaks', t => {
	t.same(
		tokenize('echo>ciao'), [
			{TOKEN: 'echo'},
			{OPERATOR: '>'},
			{TOKEN: 'ciao'},
			{EOF: true}
		]
	);
});
test('word breaks operators', t => {
	t.same(
		tokenize('<e'), [
			{OPERATOR: '<'},
			{TOKEN: 'e'},
			{EOF: true}
		]
	);
});
test('support escaping chars', t => {
	t.same(
		tokenize('echo\\<'), [
			{TOKEN: 'echo<'},
			{EOF: true}
		]
	);
});

test('character escaping is resetted on each char', t => {
	t.same(
		tokenize('echo\\<<'), [
			{TOKEN: 'echo<'},
			{OPERATOR: '<'},
			{EOF: true}
		]
	);
});
test('support quoting with single', t => {
	t.same(
		tokenize('echo \'< world >\' other'), [
			{TOKEN: 'echo'},
			{TOKEN: '< world >'},
			{TOKEN: 'other'},
			{EOF: true}
		]
	);
});

test('support quoting with double', t => {
	t.same(
		tokenize('echo "< world >" other'), [
			{TOKEN: 'echo'},
			{TOKEN: '< world >'},
			{TOKEN: 'other'},
			{EOF: true}
		]
	);
});

test('escaped double quotes within double quotes', t => {
	const result = tokenize('echo "TEST1 \\"TEST2" ucci ucci');
	t.same(
		result, [
			{TOKEN: 'echo'},
			{TOKEN: 'TEST1 "TEST2'},
			{TOKEN: 'ucci'},
			{TOKEN: 'ucci'},
			{EOF: true}
		]
	);
});
