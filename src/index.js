// const walk = require('tree-walk');
const traverse = require('bash-ast-traverser');
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
		const ast = parser.parse(sourceCode);
/*
		walk.preorder(ast, (value, key, parent) => {
			if (value !== null && typeof value === 'object') {

				console.log(Object.getPrototypeOf(value));
			}
		});
*/
		traverse(ast, {
			simple_command(node) {
				console.log('simple_command:', node);
			}
		});

		return ast;
	} catch (err) {
		throw new Error(err.stack || err.message);
	}
};
