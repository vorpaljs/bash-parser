'use strict';
const compose = require('compose-function');
const tokenDelimiter = require('./token-delimiter');
const rules = require('./tokenization-rules');
// const logger = require('./logger-iterator');

module.exports = () => ({
	lex() {
		const item = this.tokenizer.next();
		const tk = item.value;
		const tkType = Object.keys(tk)[0];
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

		return tkType;
	},
	setInput(source) {
		const tokenize = compose(
			// logger('end'),
			rules.functionName,
			rules.ioNumber,
			rules.forNameVariable,
			rules.reservedWords,
			// logger('before'),
			rules.assignmentWord,

			rules.separator,
			// logger('after'),
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
