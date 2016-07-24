'use strict';
const test = require('ava');
const bashParser = require('../src');

test('parse while', t => {
	const result = bashParser('while true; do sleep 1; done');
	// console.log(inspect(result, {depth:null}))
	t.deepEqual(
		result, {
			type: 'list',
			andOrs: [{
				type: 'andOr',
				left: [{
					type: 'while',
					clause: {
						type: 'term',
						andOrs: [{
							type: 'andOr',
							left: [{
								type: 'simple_command',
								name: {text: 'true'}
							}]
						}]
					},
					do: {
						type: 'term',
						andOrs: [{
							type: 'andOr',
							left: [{
								type: 'simple_command',
								name: {text: 'sleep'},
								suffix: {
									type: 'cmd_suffix',
									list: [{text: '1'}]
								}
							}]
						}]
					}
				}]
			}]
		}
	);
});

test('parse until', t => {
	const result = bashParser('until true; do sleep 1; done');
 //	console.log(inspect(result, {depth:null}))
	t.deepEqual(
		result, {
			type: 'list',
			andOrs: [{
				type: 'andOr',
				left: [{
					type: 'until',
					clause: {
						type: 'term',
						andOrs: [{
							type: 'andOr',
							left: [{
								type: 'simple_command',
								name: {text: 'true'}
							}]
						}]
					},
					do: {
						type: 'term',
						andOrs: [{
							type: 'andOr',
							left: [{
								type: 'simple_command',
								name: {text: 'sleep'},
								suffix: {
									type: 'cmd_suffix',
									list: [{text: '1'}]
								}
							}]
						}]
					}
				}]
			}]
		}
	);
});
