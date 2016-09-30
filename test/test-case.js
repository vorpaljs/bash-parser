'use strict';
/* eslint-disable camelcase */

const test = require('ava');
const bashParser = require('../src');
const utils = require('./_utils');

test('parse case', t => {
	const result = bashParser('case foo in * ) echo bar;; esac');
	// utils.logResults(result);
	const expected = {
		type: 'Script',
		commands: [{
			type: 'case',
			clause: {
				type: 'word',
				text: 'foo'
			},
			cases: [{
				type: 'case_item',
				pattern: [{
					type: 'word',
					text: '*'
				}],
				body: {
					type: 'compound_list',
					commands: [{
						type: 'SimpleCommand',
						name: {type: 'word', text: 'echo'},
						suffix: [{type: 'word', text: 'bar'}]
					}]
				}
			}]
		}]
	};
	utils.checkResults(t, result, expected);
});
/*
test.skip('parse case with compound list', t => {
	const result = bashParser('case foo in * ) echo foo;echo bar;; esac');
	// utils.logResults(result);
	const expected = {
		type: 'Script',
		commands: [{
			type: 'LogicalExpression',
			left: {
				type: 'Pipeline',
				commands: [{
					type: 'case',
					clause: {
						text: 'foo'
					},
					cases: [{
						type: 'case_item',
						pattern: [{
							text: '*'
						}],
						body: {
							type: 'compound_list',
							commands: [{
								type: 'LogicalExpression',
								left: {
									type: 'Pipeline',
									commands: [{
										type: 'SimpleCommand',
										name: {text: 'echo'},
										suffix: [{text: 'bar'}]
									}]
								}
							}]
						}
					}]
				}]
			}
		}]
	};

	t.is(JSON.stringify(result), JSON.stringify(expected));
});
*/
