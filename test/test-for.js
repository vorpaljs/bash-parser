'use strict';
require('babel-register');

const test = require('ava');
const bashParser = require('../src');
const utils = require('./_utils');

/* eslint-disable camelcase */
test('parse for', t => {
	const result = bashParser('for x in a b c; do echo $x; done');
	// utils.logResults(result)
	utils.checkResults(t,
		result, {
			type: 'complete_command',
			commands: [{
				type: 'for',
				name: {type: 'name', text: 'x'},
				wordlist: [{type: 'word', text: 'a'}, {type: 'word', text: 'b'}, {type: 'word', text: 'c'}],
				do: {
					type: 'compound_list',
					commands: [{
						type: 'simple_command',
						name: {type: 'word', text: 'echo'},
						suffix: [{
							type: 'word',
							text: '$x',
							expansion: [{
								type: 'parameter_expansion',
								parameter: 'x',
								loc: {
									start: 0,
									end: 1
								}
							}]
						}]
					}]
				}
			}]
		}
	);
});

test('parse for with default sequence', t => {
	const result = bashParser('for x\n do echo $x\n done');
	// utils.logResults(result)
	utils.checkResults(t,
		result, {
			type: 'complete_command',
			commands: [{
				type: 'for',
				name: {type: 'name', text: 'x'},
				do: {
					type: 'compound_list',
					commands: [{
						type: 'simple_command',
						name: {type: 'word', text: 'echo'},
						suffix: [{
							type: 'word',
							text: '$x',
							expansion: [{
								type: 'parameter_expansion',
								parameter: 'x',
								loc: {
									start: 0,
									end: 1
								}
							}]
						}]
					}]
				}
			}]
		}
	);
});

test('parse for with default sequence - on one line', t => {
	const result = bashParser('for x in; do echo $x; done');
	// utils.logResults(result)
	utils.checkResults(t,
		result, {
			type: 'complete_command',
			commands: [{
				type: 'for',
				name: {type: 'name', text: 'x'},
				do: {
					type: 'compound_list',
					commands: [{
						type: 'simple_command',
						name: {type: 'word', text: 'echo'},
						suffix: [{
							type: 'word',
							text: '$x',
							expansion: [{
								type: 'parameter_expansion',
								parameter: 'x',
								loc: {
									start: 0,
									end: 1
								}
							}]
						}]
					}]
				}
			}]
		}
	);
});
