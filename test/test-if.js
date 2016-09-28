'use strict';
require('babel-register');

const test = require('ava');
const bashParser = require('../src');
const utils = require('./_utils');

/* eslint-disable camelcase */
test('parse if', t => {
	const result = bashParser('if true; then echo 1; fi');
	// console.log(inspect(result, {depth:null}))
	utils.checkResults(t,
		result, {
			type: 'complete_command',
			commands: [{
				type: 'if',
				clause: {
					type: 'compound_list',
					commands: [{
						type: 'simple_command',
						name: {type: 'word', text: 'true'}
					}]
				},
				then: {
					type: 'compound_list',
					commands: [{
						type: 'simple_command',
						name: {type: 'word', text: 'echo'},
						suffix: [{type: 'word', text: '1'}]
					}]
				}
			}]
		}
	);
});

test('parse if else', t => {
	const result = bashParser('if true; then echo 1; else echo 2; fi');
	// utils.logResults(result);
	utils.checkResults(t,
		result, {
			type: 'complete_command',
			commands: [{
				type: 'if',
				clause: {
					type: 'compound_list',
					commands: [{
						type: 'simple_command',
						name: {type: 'word', text: 'true'}
					}]
				},
				then: {
					type: 'compound_list',
					commands: [{
						type: 'simple_command',
						name: {type: 'word', text: 'echo'},
						suffix: [{type: 'word', text: '1'}]
					}]
				},
				else: {
					type: 'compound_list',
					commands: [{
						type: 'simple_command',
						name: {type: 'word', text: 'echo'},
						suffix: [{type: 'word', text: '2'}]
					}]
				}
			}]
		}
	);
});

test('parse if else multiline', t => {
	const result = bashParser('if true; then \n echo 1;\n else\n echo 2;\n fi');
	// console.log(inspect(result, {depth:null}))
	utils.checkResults(t,
		result, {
			type: 'complete_command',
			commands: [{
				type: 'if',
				clause: {
					type: 'compound_list',
					commands: [{
						type: 'simple_command',
						name: {type: 'word', text: 'true'}
					}]
				},
				then: {
					type: 'compound_list',
					commands: [{
						type: 'simple_command',
						name: {type: 'word', text: 'echo'},
						suffix: [{type: 'word', text: '1'}]
					}]
				},
				else: {
					type: 'compound_list',
					commands: [{
						type: 'simple_command',
						name: {type: 'word', text: 'echo'},
						suffix: [{type: 'word', text: '2'}]
					}]
				}
			}]
		}
	);
});

test('parse if elif else', t => {
	const result = bashParser('if true; then echo 1; elif false; then echo 3; else echo 2; fi');
	// utils.logResults(result);
	const expected = {
		type: 'complete_command',
		commands: [{
			type: 'if',
			clause: {
				type: 'compound_list',
				commands: [{
					type: 'simple_command',
					name: {type: 'word', text: 'true'}
				}]
			},
			then: {
				type: 'compound_list',
				commands: [{
					type: 'simple_command',
					name: {type: 'word', text: 'echo'},
					suffix: [{type: 'word', text: '1'}]
				}]
			},
			else: {
				type: 'if',
				clause: {
					type: 'compound_list',
					commands: [{
						type: 'simple_command',
						name: {type: 'word', text: 'false'}
					}]
				},
				then: {
					type: 'compound_list',
					commands: [{
						type: 'simple_command',
						name: {type: 'word', text: 'echo'},
						suffix: [{type: 'word', text: '3'}]
					}]
				},
				else: {
					type: 'compound_list',
					commands: [{
						type: 'simple_command',
						name: {type: 'word', text: 'echo'},
						suffix: [{type: 'word', text: '2'}]
					}]
				}
			}
		}]
	};

	// utils.logDiff(result, expected)
	utils.checkResults(t, result, expected);
});
