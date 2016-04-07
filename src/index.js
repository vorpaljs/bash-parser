// const fs = require('fs');
// const jison = require('jison');
const posixShellLexer = require('./posix-shell-lexer');
const Parser = require('../grammar.js').Parser;
// const bnf = fs.readFileSync('grammar.jison', 'utf8');
const parser = new Parser(); // new jison.Parser(bnf);
parser.lexer = posixShellLexer();
parser.yy = require('./ast-builder');
module.exports = function parse(sourceCode) {
	try {
		return parser.parse(sourceCode);
	} catch (err) {
		throw new Error(err.message);
	}
};
