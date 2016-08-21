'use strict';
const test = require('ava');
const bashParser = require('../src');

test('command substitution', t => {
	const result = bashParser('variable=$(echo ciao)');
	// console.log(JSON.stringify(result, null, 5))

	t.deepEqual(result, {
		type: 'list',
		andOrs: [
			{
				type: 'andOr',
				left: [
					{
						type: 'simple_command',
						name: {text: ''},
						prefix: {
							type: 'cmd_prefix',
							list: [{
								text: 'variable=$(echo ciao)',
								expansion: [{
									command: 'echo ciao',
									kind: 'command',
									start: 9,
									end: 21
								}]
							}]
						}
					}
				]
			}
		]
	});
});
