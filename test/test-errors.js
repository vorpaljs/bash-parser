'use strict';
const test = require('ava');
const bashParser = require('../src');

test('syntax error contains line number', async t => {
	const error = t.throws(() => bashParser('ecoh\necho <'));
	t.is(error.message, 'Parse error on line 2: Unexpected \'EOF\'');
});
