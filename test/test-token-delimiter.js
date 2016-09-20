'use strict';
const test = require('ava');
const tokenDelimiter = require('../src/modes/posix/token-delimiter')();
const mkloc = require('./_utils').mkloc;
// const utils = require('./_utils');

/* eslint-disable camelcase */
function tokenize(text) {
	const results = Array.from(tokenDelimiter(text)).map(t => {
		const r = Object.assign({}, t);
		delete r._;
		delete r.type;
		delete r.value;

		return r;
	});
	return results;
}

test('emit EOF at end', t => {
	t.deepEqual(
		tokenize(''),
		[{
			EOF: true,
			loc: mkloc(0, 0, 0, 0)
		}]
	);
});

test('parse single operator', t => {
	t.deepEqual(
		tokenize('<<'),
		[{
			OPERATOR: '<<',
			loc: mkloc(0, 0, 0, 1)
		}, {
			EOF: true,
			loc: mkloc(0, 2, 0, 2)
		}]
	);
});

test('parse two operators on two lines', t => {
	t.deepEqual(
		tokenize('<<\n>>'), [
			{
				OPERATOR: '<<',
				loc: mkloc(0, 0, 0, 1)
			}, {
				NEWLINE: '\n',
				loc: mkloc(0, 2, 0, 2)
			}, {
				OPERATOR: '>>',
				loc: mkloc(1, 0, 1, 1)
			}, {
				EOF: true,
				loc: mkloc(1, 2, 1, 2)
			}
		]
	);
});

test('parse two operators on one line', t => {
	t.deepEqual(
		tokenize('<< >>'), [
			{
				OPERATOR: '<<',
				loc: mkloc(0, 0, 0, 1)
			}, {
				OPERATOR: '>>',
				loc: mkloc(0, 3, 0, 4)
			}, {
				EOF: true,
				loc: mkloc(0, 5, 0, 5)
			}
		]
	);
});

test('parse two tokens', t => {
	t.deepEqual(
		tokenize('echo 42'), [
			{
				TOKEN: 'echo',
				loc: mkloc(0, 0, 0, 3)
			}, {
				TOKEN: '42',
				loc: mkloc(0, 5, 0, 6)
			}, {
				EOF: true,
				loc: mkloc(0, 7, 0, 7)
			}
		]
	);
});

test('parse two tokens on two lines', t => {
	t.deepEqual(
		tokenize('echo\n42'), [
			{
				TOKEN: 'echo',
				loc: mkloc(0, 0, 0, 3)
			}, {
				NEWLINE: '\n',
				loc: mkloc(0, 4, 0, 4)
			}, {
				TOKEN: '42',
				loc: mkloc(1, 0, 1, 1)
			}, {
				EOF: true,
				loc: mkloc(1, 2, 1, 2)
			}
		]
	);
});

test('keep multiple newlines', t => {
	const result = tokenize('echo\n\n\n42');
	// utils.logResults(result);

	t.deepEqual(result, [
		{
			TOKEN: 'echo',
			loc: mkloc(0, 0, 0, 3)
		}, {
			NEWLINE: '\n',
			loc: mkloc(0, 4, 0, 4)
		}, {
			NEWLINE: '\n',
			loc: mkloc(1, 0, 1, 0)
		}, {
			NEWLINE: '\n',
			loc: mkloc(2, 0, 2, 0)
		}, {
			TOKEN: '42',
			loc: mkloc(3, 0, 3, 1)
		}, {
			EOF: true,
			loc: mkloc(3, 2, 3, 2)
		}
	]);
});

test('operator breaks words', t => {
	t.deepEqual(
		tokenize('e<'), [
			{
				TOKEN: 'e',
				loc: mkloc(0, 0, 0, 0)
			}, {
				OPERATOR: '<',
				loc: mkloc(0, 1, 0, 1)
			}, {
				EOF: true,
				loc: mkloc(0, 2, 0, 2)
			}
		]
	);
});

test('double breaks', t => {
	t.deepEqual(
		tokenize('echo>ciao'), [
			{
				TOKEN: 'echo',
				loc: mkloc(0, 0, 0, 3)
			}, {
				OPERATOR: '>',
				loc: mkloc(0, 4, 0, 4)
			}, {
				TOKEN: 'ciao',
				loc: mkloc(0, 5, 0, 8)
			}, {
				EOF: true,
				loc: mkloc(0, 9, 0, 9)
			}
		]
	);
});

test('word breaks operators', t => {
	t.deepEqual(
		tokenize('<e'), [
			{
				OPERATOR: '<',
				loc: mkloc(0, 0, 0, 0)
			}, {
				TOKEN: 'e',
				loc: mkloc(0, 1, 0, 1)
			}, {
				EOF: true,
				loc: mkloc(0, 2, 0, 2)
			}
		]
	);
});
test('support escaping chars', t => {
	t.deepEqual(
		tokenize('echo\\<'), [
			{
				TOKEN: 'echo\\<',
				loc: mkloc(0, 0, 0, 5)
			}, {
				EOF: true,
				loc: mkloc(0, 6, 0, 6)
			}
		]
	);
});

test('character escaping is resetted on each char', t => {
	t.deepEqual(
		tokenize('echo\\<<'), [
			{
				TOKEN: 'echo\\<',
				loc: mkloc(0, 0, 0, 5)
			}, {
				OPERATOR: '<',
				loc: mkloc(0, 6, 0, 6)
			}, {
				EOF: true,
				loc: mkloc(0, 7, 0, 7)
			}
		]
	);
});
test('support quoting with single', t => {
	const result = tokenize('echo \'< world >\' other');
	// utils.logResults(result);

	t.deepEqual(result, [{
		TOKEN: 'echo',
		loc: mkloc(0, 0, 0, 3)
	}, {
		TOKEN: '\'< world >\'',
		loc: mkloc(0, 5, 0, 15)
	}, {
		TOKEN: 'other',
		loc: mkloc(0, 17, 0, 21)
	}, {
		EOF: true,
		loc: mkloc(0, 22, 0, 22)
	}]);
});

test('support quoting with double', t => {
	t.deepEqual(
		tokenize('echo "< world >" other'), [
			{
				TOKEN: 'echo',
				loc: mkloc(0, 0, 0, 3)
			}, {
				TOKEN: '"< world >"',
				loc: mkloc(0, 5, 0, 15)
			}, {
				TOKEN: 'other',
				loc: mkloc(0, 17, 0, 21)
			}, {
				EOF: true,
				loc: mkloc(0, 22, 0, 22)
			}
		]
	);
});

test('escaped double quotes within double quotes', t => {
	const result = tokenize('echo "TEST1 \\"TEST2" ucci ucci');
	t.deepEqual(
		result, [
			{
				TOKEN: 'echo',
				loc: mkloc(0, 0, 0, 3)
			}, {
				TOKEN: '"TEST1 \\"TEST2"',
				loc: mkloc(0, 5, 0, 19)
			}, {
				TOKEN: 'ucci',
				loc: mkloc(0, 21, 0, 24)
			}, {
				TOKEN: 'ucci',
				loc: mkloc(0, 26, 0, 29)
			}, {
				EOF: true,
				loc: mkloc(0, 30, 0, 30)
			}
		]
	);
});
