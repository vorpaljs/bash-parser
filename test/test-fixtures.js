'use strict';
const test = require('ava');
const bashParser = require('../src');
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

test.only('3', t => {
	const result = bashParser('IFS= read -r var');
	console.log(JSON.stringify(result, null, 5))
	t.deepEqual(result, {
		type: 'list',
		andOrs: [{
			type: 'andOr',
			left: [{
				type: 'simple_command',
				name: 'read',
				prefix: {type: 'cmd_prefix', list: ['IFS=']},
				suffix: {type: 'cmd_suffix', list: ['-r', 'var']}
			}]
		}]
	});
});

test('4', t => {
	const result = bashParser('foo | IFS= read var');
	// console.log(inspect(result, {depth: null}));

	t.deepEqual(result, {
		type: 'list',
		andOrs: [{
			type: 'andOr',
			left: [{
				type: 'simple_command',
				name: 'foo'
			}, {
				type: 'simple_command',
				name: 'read',
				prefix: {type: 'cmd_prefix', list: ['IFS=']},
				suffix: {type: 'cmd_suffix', list: ['var']}
			}]
		}]
	});
});

test('5', t => {
	const result = bashParser(
`foo='hello ; rm -rf /'
dest=bar
eval "$dest=$foo"`
);

	t.deepEqual(result, {
		type: 'list',
		andOrs: [{
			type: 'andOr',
			left: [{
				type: 'simple_command',
				name: '',
				prefix: {
					type: 'cmd_prefix',
					list: ['foo=\'hello ; rm -rf /\'']
				}
			}]
		}, {
			type: 'andOr',
			left: [{
				type: 'simple_command',
				name: '',
				prefix: {
					type: 'cmd_prefix',
					list: ['dest=bar']
				}
			}]
		}, {
			type: 'andOr',
			left: [{
				type: 'simple_command',
				name: 'eval',
				suffix: {
					type: 'cmd_suffix',
					list: ['"$dest=$foo"']
				}
			}]
		}]
	});
});
