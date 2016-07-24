'use strict';
const test = require('ava');
const bashParser = require('../src');

// test.skip('parse case with substitutions in clause', t => {});

test('parse case', t => {
	const result = bashParser('case foo in * ) echo bar;; esac');

	const expected = {
		type: 'list',
		andOrs: [{
			type: 'andOr',
			left: [{
				type: 'case',
				clause: {
					text: 'foo'
				},
				cases: [{
					type: 'pattern',
					pattern: [{
						text: '*'
					}],
					body: {
						type: 'term',
						andOrs: [{
							type: 'andOr',
							left: [{
								type: 'simple_command',
								name: {text: 'echo'},
								suffix: {
									type: 'cmd_suffix',
									list: [{text: 'bar'}]
								}
							}]
						}]
					}
				}]
			}]
		}]
	};

	t.is(JSON.stringify(result), JSON.stringify(expected));
});
