'use strict';
/* eslint-disable camelcase */
require('babel-register');

const test = require('ava');
const bashParser = require('../src');
const utils = require('./_utils');

test('parse case', t => {
	const result = bashParser('case foo in * ) echo bar;; esac');
	// utils.logResults(result);
	const expected = {
		type: 'complete_command',
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
						type: 'simple_command',
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
		type: 'complete_command',
		commands: [{
			type: 'and_or',
			left: {
				type: 'pipeline',
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
								type: 'and_or',
								left: {
									type: 'pipeline',
									commands: [{
										type: 'simple_command',
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
