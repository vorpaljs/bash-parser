/* eslint-disable camelcase */
'use strict';
const compose = require('compose-function');
const utils = require('./utils');

const posixShellLexer = (mode, options) => ({
	lex() {
		const item = this.tokenizer.next();
		// console.log(item)
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

		if (tk.joined) {
			this.yytext.joined = tk.joined;
		}

		if (tk.fieldIdx !== undefined) {
			this.yytext.fieldIdx = tk.fieldIdx;
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
		const tokenizer = mode.tokenizer(options, utils);
		let previousPhases = [tokenizer];
		const phases = [tokenizer]
			.concat(mode.lexerPhases.map(phase => {
				const ph = phase(options, previousPhases);
				previousPhases = previousPhases.concat(ph);
				return ph;
			}));

		const tokenize = compose.apply(null, phases.reverse());
		this.tokenizer = tokenize(source);
	}
});

module.exports = posixShellLexer;
