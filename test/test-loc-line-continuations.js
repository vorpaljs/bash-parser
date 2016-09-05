'use strict';
const test = require('ava');
const bashParser = require('../src');
// const utils = require('./_utils');

test('loc take into account line continuations', t => {
	const cmd = 'echo \\\nworld';
	const result = bashParser(cmd, {insertLOC: true});

	const expected = {
		type: 'complete_command',
		loc: {
			startLine: 0,
			startColumn: 0,
			endLine: 1,
			endColumn: 4
		},
		commands: [{
			loc: {
				startLine: 0,
				startColumn: 0,
				endLine: 1,
				endColumn: 4
			},
			type: 'simple_command',
			name: {
				type: 'word', text: 'echo',
				loc: {
					startLine: 0,
					startColumn: 0,
					endLine: 0,
					endColumn: 3
				}
			},
			suffix: [{
				type: 'word', text: 'world',
				loc: {
					startLine: 1,
					startColumn: 0,
					endLine: 1,
					endColumn: 4
				}
			}]
		}]
	};

	// utils.logResults(result);

	t.deepEqual(result, expected);
});
