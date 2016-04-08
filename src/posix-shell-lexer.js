'use strict';
const compose = require('compose-function');
const tokenDelimiter = require('./token-delimiter');
const rules = require('./tokenization-rules');
const logger = require('./logger-iterator');

module.exports = () => ({
	lex() {
		const item = this.tokenizer.next();
		const tk = item.value;
		const tkType = Object.keys(tk)[0];
		this.yytext = tk[tkType];
		return tkType;
	},
	setInput(source) {
		const tokenize = compose(
			logger('end'),
			rules.functionName,
			rules.ioNumber,
			rules.forNameVariable,
			rules.reservedWords,
			rules.assignmentWord,
			rules.separator,
			logger('after'),
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
