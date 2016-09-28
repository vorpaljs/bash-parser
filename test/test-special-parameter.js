'use strict';
require('babel-register');

const test = require('ava');
const bashParser = require('../src');
const utils = require('./_utils');

/* eslint-disable camelcase */
test('positional list paramter', t => {
	const result = bashParser('echoword=$@');
	// console.log(JSON.stringify(result, null, 5))
	utils.checkResults(t, result, {
		type: 'complete_command',
		commands: [{
			type: 'simple_command',
			name: {type: 'word', text: ''},
			prefix: [{
				type: 'assignment_word',
				text: 'echoword=$@',
				expansion: [{
					type: 'parameter_expansion',
					parameter: '@',
					kind: 'positional-list',
					loc: {
						start: 9,
						end: 10
					}
				}]
			}]
		}]
	});
});

test('positional string paramter', t => {
	const result = bashParser('echoword=$*');
	utils.checkResults(t, result, {
		type: 'complete_command',
		commands: [{
			type: 'simple_command',
			name: {type: 'word', text: ''},
			prefix: [{
				type: 'assignment_word',
				text: 'echoword=$*',
				expansion: [{
					type: 'parameter_expansion',
					parameter: '*',
					kind: 'positional-string',
					loc: {
						start: 9,
						end: 10
					}
				}]
			}]
		}]
	});
});

test('positional count paramter', t => {
	const result = bashParser('echoword=$#');
	utils.checkResults(t, result, {
		type: 'complete_command',
		commands: [{
			type: 'simple_command',
			name: {type: 'word', text: ''},
			prefix: [{
				type: 'assignment_word',
				text: 'echoword=$#',
				expansion: [{
					type: 'parameter_expansion',
					parameter: '#',
					kind: 'positional-count',
					loc: {
						start: 9,
						end: 10
					}
				}]
			}]
		}]
	});
});

test('last exit status', t => {
	const result = bashParser('echoword=$?');
	utils.checkResults(t, result, {
		type: 'complete_command',
		commands: [{
			type: 'simple_command',
			name: {type: 'word', text: ''},
			prefix: [{
				type: 'assignment_word',
				text: 'echoword=$?',
				expansion: [{
					type: 'parameter_expansion',
					parameter: '?',
					kind: 'last-exit-status',
					loc: {
						start: 9,
						end: 10
					}
				}]
			}]
		}]
	});
});

test('current option flags', t => {
	const result = bashParser('echoword=$-');
	utils.checkResults(t, result, {
		type: 'complete_command',
		commands: [{
			type: 'simple_command',
			name: {type: 'word', text: ''},
			prefix: [{
				type: 'assignment_word',
				text: 'echoword=$-',
				expansion: [{
					type: 'parameter_expansion',
					parameter: '-',
					kind: 'current-option-flags',
					loc: {
						start: 9,
						end: 10
					}
				}]
			}]
		}]
	});
});

test('shell process id', t => {
	const result = bashParser('echoword=$$');
	utils.checkResults(t, result, {
		type: 'complete_command',
		commands: [{
			type: 'simple_command',
			name: {type: 'word', text: ''},
			prefix: [{
				type: 'assignment_word',
				text: 'echoword=$$',
				expansion: [{
					type: 'parameter_expansion',
					parameter: '$',
					kind: 'shell-process-id',
					loc: {
						start: 9,
						end: 10
					}
				}]
			}]
		}]
	});
});

test('last background pid', t => {
	const result = bashParser('echoword=$!');
	utils.checkResults(t, result, {
		type: 'complete_command',
		commands: [{
			type: 'simple_command',
			name: {type: 'word', text: ''},
			prefix: [{
				type: 'assignment_word',
				text: 'echoword=$!',
				expansion: [{
					type: 'parameter_expansion',
					parameter: '!',
					kind: 'last-background-pid',
					loc: {
						start: 9,
						end: 10
					}
				}]
			}]
		}]
	});
});

test('shell script name', t => {
	const result = bashParser('echoword=$0');
	// logResults(result);
	utils.checkResults(t, result, {
		type: 'complete_command',
		commands: [{
			type: 'simple_command',
			name: {type: 'word', text: ''},
			prefix: [{
				type: 'assignment_word',
				text: 'echoword=$0',
				expansion: [{
					type: 'parameter_expansion',
					parameter: '0',
					kind: 'shell-script-name',
					loc: {
						start: 9,
						end: 10
					}
				}]
			}]
		}]
	});
});
