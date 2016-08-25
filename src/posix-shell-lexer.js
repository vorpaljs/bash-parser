/* eslint-disable camelcase */
'use strict';
const compose = require('compose-function');
const tokenDelimiter = require('./token-delimiter');
const rules = require('./tokenization-rules');
const parameterExpansion = require('./parameter-expansion');
const commandExpansion = require('./command-expansion');
// const logger = require('./logger-iterator');

module.exports = () => ({
	lex() {
		const item = this.tokenizer.next();

		const tk = item.value;

		const tkType = Object.keys(tk).filter(k =>
			k !== 'loc' && k !== 'expansion'
		)[0];

		const text = tk[tkType];
		// expansion happens only on WORD and ASSIGNMENT_WORD tokens
		if (tkType === 'WORD' || tkType === 'ASSIGNMENT_WORD') {
			this.yytext = {
				text: text,
				expansion: tk.expansion
			};
		} else {
			this.yytext = text;
		}

		if (tk.loc) {
			this.yyloc = {
				first_column: tk.loc.startColumn,
				first_line: tk.loc.startLine,
				last_line: tk.loc.endLine,
				last_column: tk.loc.endColumn
			};
			this.yylloc = this.yyloc;
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
			parameterExpansion,
			// logger('before'),
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
