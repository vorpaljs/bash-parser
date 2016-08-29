'use strict';
const test = require('ava');
const bashParser = require('../src');
/* eslint-disable camelcase */
test('parse while', t => {
	const result = bashParser('while true; do sleep 1; done');
	// console.log(inspect(result, {depth:null}))
	t.deepEqual(
		result, {
			type: 'complete_command',
			and_ors: [{
				type: 'and_or',
				left: {
					type: 'pipeline',
					commands: [{
						type: 'while',
						clause: {
							type: 'term',
							and_ors: [{
								type: 'and_or',
								left: {
									type: 'pipeline',
									commands: [{
										type: 'simple_command',
										name: {text: 'true'}
									}]
								}
							}]
						},
						do: {
							type: 'term',
							and_ors: [{
								type: 'and_or',
								left: {
									type: 'pipeline',
									commands: [{
										type: 'simple_command',
										name: {text: 'sleep'},
										suffix: {
											type: 'cmd_suffix',
											list: [{text: '1'}]
										}
									}]
								}
							}]
						}
					}]
				}
			}]
		}
	);
});

test('parse until', t => {
	const result = bashParser('until true; do sleep 1; done');
 //	console.log(inspect(result, {depth:null}))
	t.deepEqual(
		result, {
			type: 'complete_command',
			and_ors: [{
				type: 'and_or',
				left: {
					type: 'pipeline',
					commands: [{
						type: 'until',
						clause: {
							type: 'term',
							and_ors: [{
								type: 'and_or',
								left: {
									type: 'pipeline',
									commands: [{
										type: 'simple_command',
										name: {text: 'true'}
									}]
								}
							}]
						},
						do: {
							type: 'term',
							and_ors: [{
								type: 'and_or',
								left: {
									type: 'pipeline',
									commands: [{
										type: 'simple_command',
										name: {text: 'sleep'},
										suffix: {
											type: 'cmd_suffix',
											list: [{text: '1'}]
										}
									}]
								}
							}]
						}
					}]
				}
			}]
		}
	);
});
