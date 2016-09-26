'use strict';
import 'babel-register';
const test = require('ava');
const bashParser = require('../src');
const utils = require('./_utils');

// various example taken from http://www.etalabs.net/sh_tricks.html

test('2', t => {
	const result = bashParser('echo () { printf %s\\n "$*" ; }');
	// utils.logResults(result);
	utils.checkResults(t, result, {
		type: 'complete_command',
		commands: [
			{
				type: 'function',
				name: {
					text: 'echo',
					type: 'name'
				},
				body: {
					type: 'compound_list',
					commands: [
						{
							type: 'simple_command',
							name: {
								text: 'printf',
								type: 'word'
							},
							suffix: [
								{
									text: '%sn',
									type: 'word'
								},
								{
									text: '"$*"',
									expansion: [
										{
											kind: 'positional-string',
											parameter: '*',
											start: 1,
											end: 3,
											type: 'parameter_expansion'
										}
									],
									type: 'word'
								}
							]
						}
					]
				}
			}
		]});
});

test('3', t => {
	const result = bashParser('IFS= read -r var');
	utils.checkResults(t, result, {
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

	utils.checkResults(t, result, {
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

	utils.checkResults(t, result, {
		type: 'complete_command',
		commands: [{
			type: 'simple_command',
			name: {type: 'word', text: ''},
			prefix: [{type: 'assignment_word', text: 'foo=hello ; rm -rf /'}]
		}, {
			type: 'simple_command',
			name: {type: 'word', text: ''},
			prefix: [{type: 'assignment_word', text: 'dest=bar'}]
		}, {
			type: 'simple_command',
			name: {type: 'word', text: 'eval'},
			suffix: [{type: 'word', text: 'dest=foo'}]
		}]
	});
});
