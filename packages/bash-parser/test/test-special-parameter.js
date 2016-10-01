'use strict';

const test = require('ava');
const bashParser = require('../src');
const utils = require('./_utils');

/* eslint-disable camelcase */
test('positional list paramter', t => {
	const result = bashParser('echoword=$@');
	// console.log(JSON.stringify(result, null, 5))
	utils.checkResults(t, result, {
		type: 'Script',
		commands: [{
			type: 'Command',
			name: {type: 'Word', text: ''},
			prefix: [{
				type: 'AssignmentWord',
				text: 'echoword=$@',
				expansion: [{
					type: 'ParameterExpansion',
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
		type: 'Script',
		commands: [{
			type: 'Command',
			name: {type: 'Word', text: ''},
			prefix: [{
				type: 'AssignmentWord',
				text: 'echoword=$*',
				expansion: [{
					type: 'ParameterExpansion',
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
		type: 'Script',
		commands: [{
			type: 'Command',
			name: {type: 'Word', text: ''},
			prefix: [{
				type: 'AssignmentWord',
				text: 'echoword=$#',
				expansion: [{
					type: 'ParameterExpansion',
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
		type: 'Script',
		commands: [{
			type: 'Command',
			name: {type: 'Word', text: ''},
			prefix: [{
				type: 'AssignmentWord',
				text: 'echoword=$?',
				expansion: [{
					type: 'ParameterExpansion',
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
		type: 'Script',
		commands: [{
			type: 'Command',
			name: {type: 'Word', text: ''},
			prefix: [{
				type: 'AssignmentWord',
				text: 'echoword=$-',
				expansion: [{
					type: 'ParameterExpansion',
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
		type: 'Script',
		commands: [{
			type: 'Command',
			name: {type: 'Word', text: ''},
			prefix: [{
				type: 'AssignmentWord',
				text: 'echoword=$$',
				expansion: [{
					type: 'ParameterExpansion',
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
		type: 'Script',
		commands: [{
			type: 'Command',
			name: {type: 'Word', text: ''},
			prefix: [{
				type: 'AssignmentWord',
				text: 'echoword=$!',
				expansion: [{
					type: 'ParameterExpansion',
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
		type: 'Script',
		commands: [{
			type: 'Command',
			name: {type: 'Word', text: ''},
			prefix: [{
				type: 'AssignmentWord',
				text: 'echoword=$0',
				expansion: [{
					type: 'ParameterExpansion',
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
