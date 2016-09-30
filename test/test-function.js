'use strict';

const test = require('ava');
const bashParser = require('../src');
const utils = require('./_utils');

/* eslint-disable camelcase */

test('parse function declaration multiple lines', t => {
	const result = bashParser('foo () \n{\n command bar --lol;\n}');
	// utils.logResults(result);
	utils.checkResults(t,
		result, {
			type: 'Script',
			commands: [{
				type: 'Function',
				name: {type: 'Name', text: 'foo'},
				body: {
					type: 'CompoundList',
					commands: [{
						type: 'SimpleCommand',
						name: {type: 'Word', text: 'command'},
						suffix: [{type: 'Word', text: 'bar'}, {type: 'Word', text: '--lol'}]
					}]
				}
			}]
		}
	);
});

test('parse function declaration', t => {
	const result = bashParser('foo	(){ command bar --lol;  }');

	utils.checkResults(t,
		result, {
			type: 'Script',
			commands: [{
				type: 'Function',
				name: {type: 'Name', text: 'foo'},
				body: {
					type: 'CompoundList',
					commands: [{
						type: 'SimpleCommand',
						name: {type: 'Word', text: 'command'},
						suffix: [{type: 'Word', text: 'bar'}, {type: 'Word', text: '--lol'}]
					}]
				}
			}]
		}
	);
});
