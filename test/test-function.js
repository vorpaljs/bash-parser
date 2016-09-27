'use strict';
import 'babel-register';

const test = require('ava');
const bashParser = require('../src');
const utils = require('./_utils');

/* eslint-disable camelcase */

test('parse function declaration multiple lines', t => {
	const result = bashParser('foo () \n{\n command bar --lol;\n}');
	// utils.logResults(result);
	utils.checkResults(t,
		result, {
			type: 'complete_command',
			commands: [{
				type: 'function',
				name: {type: 'name', text: 'foo'},
				body: {
					type: 'compound_list',
					commands: [{
						type: 'simple_command',
						name: {type: 'word', text: 'command'},
						suffix: [{type: 'word', text: 'bar'}, {type: 'word', text: '--lol'}]
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
			type: 'complete_command',
			commands: [{
				type: 'function',
				name: {type: 'name', text: 'foo'},
				body: {
					type: 'compound_list',
					commands: [{
						type: 'simple_command',
						name: {type: 'word', text: 'command'},
						suffix: [{type: 'word', text: 'bar'}, {type: 'word', text: '--lol'}]
					}]
				}
			}]
		}
	);
});
