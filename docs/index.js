'use strict';
require('babel-polyfill');
const bashParser = require('../src');

const $ = global.$;

function parseSource() {
	try {
		$('#error').hide();
		const ast = bashParser($('#source').val());
		$('#ast').html(JSON.stringify(ast, null, 2));
	} catch (err) {
		$('#error').html(err.message);
		$('#error').show();
	}
}

$('#parse').click(parseSource);
parseSource();
