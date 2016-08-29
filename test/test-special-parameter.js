'use strict';
const test = require('ava');
const bashParser = require('../src');
/* eslint-disable camelcase */
test('positional list paramter', t => {
	const result = bashParser('echoword=$@');
	// console.log(JSON.stringify(result, null, 5))
	t.deepEqual(result, {
		type: 'list',
		and_ors: [
			{
				type: 'and_or',
				left: [
					{
						type: 'simple_command',
						name: {text: ''},
						prefix: {
							type: 'cmd_prefix',
							list: [{
								text: 'echoword=$@',
								expansion: [{
									parameter: '@',
									kind: 'positional-list',
									start: 9,
									end: 11
								}]
							}]
						}
					}
				]
			}
		]
	});
});

test('positional string paramter', t => {
	const result = bashParser('echoword=$*');
	t.deepEqual(result, {
		type: 'list',
		and_ors: [
			{
				type: 'and_or',
				left: [
					{
						type: 'simple_command',
						name: {text: ''},
						prefix: {
							type: 'cmd_prefix',
							list: [{
								text: 'echoword=$*',
								expansion: [{
									parameter: '*',
									kind: 'positional-string',
									start: 9,
									end: 11
								}]
							}]
						}
					}
				]
			}
		]
	});
});

test('positional count paramter', t => {
	const result = bashParser('echoword=$#');
	t.deepEqual(result, {
		type: 'list',
		and_ors: [
			{
				type: 'and_or',
				left: [
					{
						type: 'simple_command',
						name: {text: ''},
						prefix: {
							type: 'cmd_prefix',
							list: [{
								text: 'echoword=$#',
								expansion: [{
									parameter: '#',
									kind: 'positional-count',
									start: 9,
									end: 11
								}]
							}]
						}
					}
				]
			}
		]
	});
});

test('last exit status', t => {
	const result = bashParser('echoword=$?');
	t.deepEqual(result, {
		type: 'list',
		and_ors: [
			{
				type: 'and_or',
				left: [
					{
						type: 'simple_command',
						name: {text: ''},
						prefix: {
							type: 'cmd_prefix',
							list: [{
								text: 'echoword=$?',
								expansion: [{
									parameter: '?',
									kind: 'last-exit-status',
									start: 9,
									end: 11
								}]
							}]
						}
					}
				]
			}
		]
	});
});

test('current option flags', t => {
	const result = bashParser('echoword=$-');
	t.deepEqual(result, {
		type: 'list',
		and_ors: [
			{
				type: 'and_or',
				left: [
					{
						type: 'simple_command',
						name: {text: ''},
						prefix: {
							type: 'cmd_prefix',
							list: [{
								text: 'echoword=$-',
								expansion: [{
									parameter: '-',
									kind: 'current-option-flags',
									start: 9,
									end: 11
								}]
							}]
						}
					}
				]
			}
		]
	});
});

test('shell process id', t => {
	const result = bashParser('echoword=$$');
	t.deepEqual(result, {
		type: 'list',
		and_ors: [
			{
				type: 'and_or',
				left: [
					{
						type: 'simple_command',
						name: {text: ''},
						prefix: {
							type: 'cmd_prefix',
							list: [{
								text: 'echoword=$$',
								expansion: [{
									parameter: '$',
									kind: 'shell-process-id',
									start: 9,
									end: 11
								}]
							}]
						}
					}
				]
			}
		]
	});
});

test('last background pid', t => {
	const result = bashParser('echoword=$!');
	t.deepEqual(result, {
		type: 'list',
		and_ors: [
			{
				type: 'and_or',
				left: [
					{
						type: 'simple_command',
						name: {text: ''},
						prefix: {
							type: 'cmd_prefix',
							list: [{
								text: 'echoword=$!',
								expansion: [{
									parameter: '!',
									kind: 'last-background-pid',
									start: 9,
									end: 11
								}]
							}]
						}
					}
				]
			}
		]
	});
});

test('shell script name', t => {
	const result = bashParser('echoword=$0');
	t.deepEqual(result, {
		type: 'list',
		and_ors: [
			{
				type: 'and_or',
				left: [
					{
						type: 'simple_command',
						name: {text: ''},
						prefix: {
							type: 'cmd_prefix',
							list: [{
								text: 'echoword=$0',
								expansion: [{
									parameter: '0',
									kind: 'shell-script-name',
									start: 9,
									end: 11
								}]
							}]
						}
					}
				]
			}
		]
	});
});
