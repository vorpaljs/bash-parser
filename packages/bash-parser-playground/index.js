'use strict';
require('babel-polyfill');
const bashParser = require('bash-parser');

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

$('#source').change(parseSource);
$('#source').keyup(parseSource);
parseSource();
