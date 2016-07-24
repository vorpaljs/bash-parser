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

test('3', t => {
	const result = bashParser('IFS= read -r var');
	t.deepEqual(result, {
		type: 'list',
		andOrs: [{
			type: 'andOr',
			left: [{
				type: 'simple_command',
				name: {text: 'read'},
				prefix: {type: 'cmd_prefix', list: [{text: 'IFS='}]},
				suffix: {type: 'cmd_suffix', list: [{text: '-r'}, {text: 'var'}]}
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
				name: {text: 'foo'}
			}, {
				type: 'simple_command',
				name: {text: 'read'},
				prefix: {type: 'cmd_prefix', list: [{text: 'IFS='}]},
				suffix: {type: 'cmd_suffix', list: [{text: 'var'}]}
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
	// console.log(JSON.stringify(result, null, 5))

	t.deepEqual(result, {
		type: 'list',
		andOrs: [{
			type: 'andOr',
			left: [{
				type: 'simple_command',
				name: {text: ''},
				prefix: {
					type: 'cmd_prefix',
					list: [{text: 'foo=\'hello ; rm -rf /\''}]
				}
			}]
		}, {
			type: 'andOr',
			left: [{
				type: 'simple_command',
				name: {text: ''},
				prefix: {
					type: 'cmd_prefix',
					list: [{text: 'dest=bar'}]
				}
			}]
		}, {
			type: 'andOr',
			left: [{
				type: 'simple_command',
				name: {text: 'eval'},
				suffix: {
					type: 'cmd_suffix',
					list: [{text: '"dest=foo"'}]
				}
			}]
		}]
	});
});
