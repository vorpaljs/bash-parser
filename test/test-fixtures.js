'use strict';

const test = require('ava');
const bashParser = require('../src');
const utils = require('./_utils');

// various example taken from http://www.etalabs.net/sh_tricks.html

test('2', t => {
	const result = bashParser('echo () { printf %s\\n "$*" ; }');
	// utils.logResults(result);
	utils.checkResults(t, result, {
		type: 'Script',
		commands: [
			{
				type: 'Function',
				name: {
					text: 'echo',
					type: 'Name'
				},
				body: {
					type: 'CompoundList',
					commands: [
						{
							type: 'SimpleCommand',
							name: {
								text: 'printf',
								type: 'Word'
							},
							suffix: [
								{
									text: '%sn',
									type: 'Word'
								},
								{
									text: '"$*"',
									expansion: [
										{
											kind: 'positional-string',
											parameter: '*',
											loc: {
												start: 1,
												end: 2
											},
											type: 'ParameterExpansion'
										}
									],
									type: 'Word'
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
		type: 'Script',
		commands: [{
			type: 'SimpleCommand',
			name: {type: 'Word', text: 'read'},
			prefix: [{type: 'AssignmentWord', text: 'IFS='}],
			suffix: [{type: 'Word', text: '-r'}, {type: 'Word', text: 'var'}]
		}]
	});
});

test('4', t => {
	const result = bashParser('foo | IFS= read var');
	// console.log(inspect(result, {depth: null}));

	utils.checkResults(t, result, {
		type: 'Script',
		commands: [{
			type: 'Pipeline',
			commands: [{
				type: 'SimpleCommand',
				name: {type: 'Word', text: 'foo'}
			}, {
				type: 'SimpleCommand',
				name: {type: 'Word', text: 'read'},
				prefix: [{type: 'AssignmentWord', text: 'IFS='}],
				suffix: [{type: 'Word', text: 'var'}]
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
		type: 'Script',
		commands: [{
			type: 'SimpleCommand',
			name: {type: 'Word', text: ''},
			prefix: [{type: 'AssignmentWord', text: 'foo=hello ; rm -rf /'}]
		}, {
			type: 'SimpleCommand',
			name: {type: 'Word', text: ''},
			prefix: [{type: 'AssignmentWord', text: 'dest=bar'}]
		}, {
			type: 'SimpleCommand',
			name: {type: 'Word', text: 'eval'},
			suffix: [{type: 'Word', text: 'dest=foo'}]
		}]
	});
});
