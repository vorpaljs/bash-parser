'use strict';

const posixShellLexer = require('./posix-shell-lexer');

module.exports = function parse(sourceCode, options) {
	try {
		options = options || {};
		options.mode = options.mode || 'posix';

		const modePlugin = require(`./modes/${options.mode}`);
		const mode = modePlugin.init(null);

		const Parser = mode.grammar.Parser;
		const astBuilder = mode.astBuilder;
		const parser = new Parser();
		parser.lexer = posixShellLexer(mode, options);
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
