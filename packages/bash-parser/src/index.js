'use strict';

const shellLexer = require('./shell-lexer');
const utils = require('./utils');

// preload all modes to have them browserified
const modes = {
	'bash': require('./modes/bash'),
	'posix': require('./modes/posix'),
	'word-expansion': require('./modes/word-expansion')
};

function loadPlugin(name) {
	const modePlugin = modes[name];

	if (modePlugin.inherits) {
		return modePlugin.init(loadPlugin(modePlugin.inherits), utils);
	}
	return modePlugin.init(null, utils);
}

module.exports = function parse(sourceCode, options) {
	try {
		options = options || {};
		options.mode = options.mode || 'posix';

		const mode = loadPlugin(options.mode);
		const Parser = mode.grammar.Parser;
		const astBuilder = mode.astBuilder;
		const parser = new Parser();
		parser.lexer = shellLexer(mode, options);
		parser.yy = astBuilder(options);

		const ast = parser.parse(sourceCode);

/*
		const fixtureFolder = `${__dirname}/../test/fixtures`;
		const json = require('json5');
		const {writeFileSync} = require('fs');

		const fileName = require('node-uuid').v4();
		const filePath = `${fixtureFolder}/${fileName}.js`;
		writeFileSync(filePath, 'module.exports = ' + json.stringify({
			sourceCode, result: ast
		}, null, '\t'));
*/
		return ast;
	} catch (err) {
		if (err instanceof SyntaxError) {
			throw err;
		}
		throw new Error(err.stack || err.message);
	}
};
