/* eslint-disable camelcase */
'use strict';
const compose = require('compose-function');
const tokenDelimiter = require('./token-delimiter');
const rules = require('./tokenization-rules');
const parameterExpansion = require('./parameter-expansion');
const commandExpansion = require('./command-expansion');
const arithmeticExpansion = require('./arithmetic-expansion');
const aliasSubstitution = require('./alias-substitution');
const defaultNodeType = require('./default-node-type');
const fieldSplitting = require('./field-splitting');
// const logger = require('./logger-iterator');

const preAliasLexer = compose(
	// aliasSubstitution(options, preAliasLexer(options)),
	rules.identifySimpleCommandNames,
	rules.assignmentWord,
	rules.identifyMaybeSimpleCommands,
	rules.reservedWords,

	rules.separator,

	rules.operatorTokens,
	rules.replaceLineTerminationToken,

	rules.newLineList,
	rules.linebreakIn,
	tokenDelimiter
);

const posixShellLexer = options => ({
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

		if (tk.originalText) {
			this.yytext.originalText = tk.originalText;
		}

		if (tk.type) {
			this.yytext.type = tk.type;
		}

		if (tk.maybeSimpleCommandName) {
			this.yytext.maybeSimpleCommandName = tk.maybeSimpleCommandName;
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

			rules.removeTempObject,
			defaultNodeType,
			fieldSplitting.split,
			arithmeticExpansion.resolve(options),
			commandExpansion.resolve(options),
			parameterExpansion.resolve(options),
			rules.functionName,
			rules.ioNumber,
			rules.forNameVariable,
			// logger('after'),
			commandExpansion,
			// logger('before'),
			arithmeticExpansion,
			parameterExpansion,

			// logger('after aliasSubstitution'),
			aliasSubstitution(options, preAliasLexer),
			rules.identifySimpleCommandNames,
			rules.assignmentWord,
			rules.identifyMaybeSimpleCommands,
			rules.reservedWords,

			rules.separator,

			rules.operatorTokens,
			rules.replaceLineTerminationToken,

			rules.newLineList,
			rules.linebreakIn,
// logger('end'),
			tokenDelimiter
		);
		this.tokenizer = tokenize(source);
	}
});

module.exports = posixShellLexer;
