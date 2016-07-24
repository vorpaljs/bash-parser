// const fs = require('fs');
// const jison = require('jison');
const Parser = require('../grammar.js').Parser;
const posixShellLexer = require('./posix-shell-lexer');
const astBuilder = require('./ast-builder');

// const bnf = fs.readFileSync('grammar.jison', 'utf8');
const parser = new Parser(); // new jison.Parser(bnf);
parser.lexer = posixShellLexer();
parser.yy = astBuilder;

module.exports = function parse(sourceCode) {
	try {
		return JSON.parse(JSON.stringify(parser.parse(sourceCode)));
	} catch (err) {
		throw new Error(err.stack || err.message);
	}
};
