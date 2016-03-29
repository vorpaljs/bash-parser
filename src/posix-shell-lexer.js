/* eslint-disable camelcase */
'use strict';
const compose = require('compose-function');
const tokenDelimiter = require('./token-delimiter');
const rules = require('./tokenization-rules');
const parameterExpansion = require('./parameter-expansion');
const commandExpansion = require('./command-expansion');
const arithmeticExpansion = require('./arithmetic-expansion');
// const logger = require('./logger-iterator');

module.exports = options => ({
	lex() {
		const item = this.tokenizer.next();

		const tk = item.value;

		const tkType = Object.keys(tk).filter(k =>
			k !== 'loc' && k !== 'expansion'
		)[0];

		const text = tk[tkType];

		this.yytext = {text};

		if (tk.expansion) {
			this.yytext.expansion = tk.expansion;
		}

		if (options.insertLOC && tk.loc) {
			this.yytext.loc = tk.loc;
		}

		if (tk.loc) {
			this.yylineno = tk.loc.startLine;
		}

		return tkType;
	},

	setInput(source) {
		const tokenize = compose(
			// logger('end'),
			rules.functionName,
			rules.ioNumber,
			rules.forNameVariable,
			// logger('after'),
			commandExpansion,
			// logger('before'),
			arithmeticExpansion,
			parameterExpansion,
			rules.reservedWords,

			rules.assignmentWord,

			rules.separator,

			rules.operatorTokens,
			rules.replaceLineTerminationToken,

			rules.newLineList,
			rules.linebreakIn,
			// logger('before'),
			tokenDelimiter
		);
		this.tokenizer = tokenize(source);
	}
});
