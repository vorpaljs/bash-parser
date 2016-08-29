'use strict';
const test = require('ava');
const bashParser = require('../src');
/* eslint-disable camelcase */
test('Redirect should be allowed immediately following argument', t => {
	const result = bashParser('echo foo>file.txt');

	t.deepEqual(result, {
		type: 'complete_command',
		and_ors: [{
			type: 'and_or',
			left: {
				type: 'pipeline',
				commands: [{
					type: 'simple_command',
					name: {text: 'echo'},
					suffix: {
						type: 'cmd_suffix',
						list: [
							{text: 'foo'},
							{
								type: 'io_redirect',
								op: {text: '>'},
								file: {text: 'file.txt'}
							}
						]
					}
				}]
			}
		}]
	});
});

test('Equal sign should be allowed in arguments', t => {
	const result = bashParser('echo foo=bar');
	t.deepEqual(result, {
		type: 'complete_command',
		and_ors: [{
			type: 'and_or',
			left: {
				type: 'pipeline',
				commands: [{
					type: 'simple_command',
					name: {text: 'echo'},
					suffix: {
						type: 'cmd_suffix',
						list: [
							{text: 'foo=bar'}
						]
					}
				}]
			}
		}]
	});
});
