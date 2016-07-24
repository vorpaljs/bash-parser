'use strict';
const test = require('ava');
const bashParser = require('../src');

test('parse function declaration multiple lines', t => {
	const result = bashParser('foo () \n{\n command bar --lol;\n}');
	// console.log(JSON.stringify(result, null, 4));

	t.deepEqual(
		result, {
			type: 'list',
			andOrs: [{
				type: 'andOr',
				left: [{
					type: 'function',
					name: 'foo',
					body: {
						type: 'term',
						andOrs: [{
							type: 'andOr',
							left: [{
								type: 'simple_command',
								name: {text: 'command'},
								suffix: {type: 'cmd_suffix', list: [{text: 'bar'}, {text: '--lol'}]}
							}]
						}]
					}
				}]
			}]
		}
	);
});

test('parse function declaration', t => {
	const result = bashParser('foo	(){ command bar --lol;}');
	// console.log(inspect(result, {depth:null}))
	t.deepEqual(
		result, {
			type: 'list',
			andOrs: [{
				type: 'andOr',
				left: [{
					type: 'function',
					name: 'foo',
					body: {
						type: 'term',
						andOrs: [{
							type: 'andOr',
							left: [{
								type: 'simple_command',
								name: {text: 'command'},
								suffix: {type: 'cmd_suffix', list: [{text: 'bar'}, {text: '--lol'}]}
							}]
						}]
					}
				}]
			}]
		}
	);
});
