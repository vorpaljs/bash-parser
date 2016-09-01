// const walk = require('tree-walk');
const assert = require('assert');
const traverse = require('bash-ast-traverser');
const Parser = require('../grammar.js').Parser;
const posixShellLexer = require('./posix-shell-lexer');
const astBuilder = require('./ast-builder');
/* eslint-disable camelcase */

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
				if (node.name.text !== '') {
					assert.ok(node.name.maybeSimpleCommandName, `expected simple_command name ${JSON.stringify(node,null,2)}`);
				}
				delete node.name.maybeSimpleCommandName;
			},

			defaultMethod(node) {
				assert.ok(!node.maybeSimpleCommandName, `simple_command name not expected ${JSON.stringify(node,null,2)}`);
				delete node.maybeSimpleCommandName;
			}
		});

		return ast;
	} catch (err) {
		throw new Error(err.stack || err.message);
	}
};
