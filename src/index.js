const Parser = require('../grammar.js').Parser;
const posixShellLexer = require('./posix-shell-lexer');
const astBuilder = require('./ast-builder');

/*
	## options

	* insertLOC: Boolean = false - whether to track line and column information for tokens
*/
module.exports = function parse(sourceCode, options) {
	try {
		options = options || {};
		const parser = new Parser();
		parser.lexer = posixShellLexer(options);
		parser.yy = astBuilder(options);

		return JSON.parse(JSON.stringify(parser.parse(sourceCode)));
	} catch (err) {
		throw new Error(err.stack || err.message);
	}
};
