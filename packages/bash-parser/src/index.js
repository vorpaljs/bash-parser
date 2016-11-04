import shellLexer from './shell-lexer';
import * as utils from './utils/index';
import bash from './modes/bash/index';
import posix from './modes/posix/index';
import wordExpansion from './modes/word-expansion/index';

parse.lexer = shellLexer;
parse.utils = utils;

const modes = {
	bash,
	posix,
	'word-expansion': wordExpansion
};

parse.modes = {
	'bash': loadPlugin('bash'),
	'posix': loadPlugin('posix'),
	'word-expansion': loadPlugin('word-expansion')
};

function loadPlugin(name) {
	const modePlugin = modes[name];

	if (modePlugin.inherits) {
		return modePlugin.init(loadPlugin(modePlugin.inherits), utils);
	}
	return modePlugin.init(null, utils);
}

export default function parse(sourceCode, options) {
	try {
		options = options || {};
		options.mode = options.mode || 'posix';

		const mode = parse.modes[options.mode];
		const Parser = mode.grammar.Parser;
		const astBuilder = mode.astBuilder;
		const parser = new Parser();
		parser.lexer = shellLexer(mode, options);
		parser.yy = astBuilder(options);

		const ast = parser.parse(sourceCode);

/*
		const fixtureFolder = `${__dirname}/../test/fixtures`;
		import json from 'json5';
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
}
