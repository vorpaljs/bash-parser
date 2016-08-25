'use strict';
const test = require('ava');
const bashParser = require('../src');

test.only('quotes within double quotes', t => {
	const result = bashParser('echo "TEST1 \'TEST2"');
	// console.log(inspect(result, {depth:null}))
	t.deepEqual(result, {
		type: 'list',
		andOrs: [{
			type: 'andOr',
			left: [{
				type: 'simple_command',
				name: {text: 'echo'},
				suffix: {
					type: 'cmd_suffix',
					list: [{text: '"TEST1 \'TEST2"'}]
				}
			}]
		}]
	});
});

test('escaped double quotes within double quotes', t => {
	const result = bashParser('echo "TEST1 \\"TEST2"');
	t.deepEqual(result, {
		type: 'list',
		andOrs: [{
			type: 'andOr',
			left: [{
				type: 'simple_command',
				name: {text: 'echo'},
				suffix: {
					type: 'cmd_suffix',
					list: [{text: '"TEST1 "TEST2"'}]
				}
			}]
		}]
	});
});

test('double quotes within single quotes', t => {
	const result = bashParser('echo \'TEST1 "TEST2\'');
	// console.log(inspect(result, {depth:null}))
	t.deepEqual(result, {
		type: 'list',
		andOrs: [{
			type: 'andOr',
			left: [{
				type: 'simple_command',
				name: {text: 'echo'},
				suffix: {
					type: 'cmd_suffix',
					list: [{text: '\'TEST1 "TEST2\''}]
				}
			}]
		}]
	});
});
