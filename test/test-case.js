'use strict';
/* eslint-disable camelcase */
const test = require('ava');
const bashParser = require('../src');
// const utils = require('./_utils');

test('parse case', t => {
	const result = bashParser('case foo in * ) echo bar;; esac');
	// utils.logResults(result);
	const expected = {
		type: 'complete_command',
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
						type: 'simple_command',
						name: {text: 'echo'},
						suffix: {
							type: 'cmd_suffix',
							list: [{text: 'bar'}]
						}
					}]
				}
			}]
		}]
	};

	t.is(JSON.stringify(result), JSON.stringify(expected));
});
/*
test.skip('parse case with compound list', t => {
	const result = bashParser('case foo in * ) echo foo;echo bar;; esac');
	utils.logResults(result);
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
										suffix: {
											type: 'cmd_suffix',
											list: [{text: 'bar'}]
										}
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
