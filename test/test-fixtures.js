'use strict';
const test = require('ava');
const bashParser = require('../src');
/* eslint-disable camelcase */
// const inspect = require('util').inspect;

// various example taken from http://www.etalabs.net/sh_tricks.html

/* TODO: make these pass
test.skip('1', t => {
	const result = bashParser(
`echo () (
fmt=%s end=\\n IFS=" "

while [ $# -gt 1 ] ; do
case "$1" in
[!-]*|-*[!ne]*) break ;;
*ne*|*en*) fmt=%b end= ;;
*n*) end= ;;
*e*) fmt=%b ;;
esac
shift
done

printf "$fmt$end" "$*"
)`
);
	t.deepEqual(result, {});
});

test.skip('2', t => {
	const result = bashParser('echo () { printf %s\\n "$*" ; }');
	t.deepEqual(result, {});
});
*/

test('3', t => {
	const result = bashParser('IFS= read -r var');
	t.deepEqual(result, {
		type: 'complete_command',
		commands: [{
			type: 'simple_command',
			name: {type: 'word', text: 'read'},
			prefix: [{type: 'assignment_word', text: 'IFS='}],
			suffix: [{type: 'word', text: '-r'}, {type: 'word', text: 'var'}]
		}]
	});
});

test('4', t => {
	const result = bashParser('foo | IFS= read var');
	// console.log(inspect(result, {depth: null}));

	t.deepEqual(result, {
		type: 'complete_command',
		commands: [{
			type: 'pipeline',
			commands: [{
				type: 'simple_command',
				name: {type: 'word', text: 'foo'}
			}, {
				type: 'simple_command',
				name: {type: 'word', text: 'read'},
				prefix: [{type: 'assignment_word', text: 'IFS='}],
				suffix: [{type: 'word', text: 'var'}]
			}]
		}]
	});
});

test('5', t => {
	const result = bashParser(
`foo='hello ; rm -rf /'
dest=bar
eval "dest=foo"`
);

	t.deepEqual(result, {
		type: 'complete_command',
		commands: [{
			type: 'simple_command',
			name: {type: 'word', text: ''},
			prefix: [{type: 'assignment_word', text: 'foo=\'hello ; rm -rf /\''}]
		}, {
			type: 'simple_command',
			name: {type: 'word', text: ''},
			prefix: [{type: 'assignment_word', text: 'dest=bar'}]
		}, {
			type: 'simple_command',
			name: {type: 'word', text: 'eval'},
			suffix: [{type: 'word', text: '"dest=foo"'}]
		}]
	});
});
