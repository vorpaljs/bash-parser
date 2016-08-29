'use strict';
/* eslint-disable camelcase */
const test = require('ava');
const bashParser = require('../src');

test('parse case', t => {
	const result = bashParser('case foo in * ) echo bar;; esac');

	const expected = {
		type: 'list',
		and_ors: [{
			type: 'and_or',
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
						and_ors: [{
							type: 'and_or',
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
