'use strict';

const shellLexer = require('./shell-lexer');
const utils = require('./utils');

function loadPlugin(name) {
	const modePlugin = require(`./modes/${name}`);

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
		return ast;
	} catch (err) {
		if (err instanceof SyntaxError) {
			throw err;
		}
		throw new Error(err.stack || err.message);
	}
};
