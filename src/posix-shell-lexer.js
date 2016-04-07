'use strict';
const compose = require('compose-function');
const tokenDelimiter = require('./token-delimiter');
const rules = require('./tokenization-rules');

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
			function * (tokens) {
				for (const tk of tokens) {
					/* console.log(
						'final:tk',
						tk
					);*/
					yield tk;
				}
			},
			rules.functionName,
			rules.ioNumber,
			rules.forNameVariable,
			rules.reservedWords,
			rules.assignmentWord,
			rules.operatorTokens,
			rules.replaceLineTerminationToken,
			tokenDelimiter
		);
		this.tokenizer = tokenize(source);
	}
});
