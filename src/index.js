'use strict';
// const traverse = require('bash-ast-traverser');

const mode = require('./modes/posix');
const posixShellLexer = require('./posix-shell-lexer');

const Parser = mode.grammar.Parser;
const astBuilder = mode.astBuilder;

module.exports = function parse(sourceCode, options) {
	try {
		options = options || {};
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
