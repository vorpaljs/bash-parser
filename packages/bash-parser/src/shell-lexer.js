'use strict';
const compose = require('compose-function');

const posixShellLexer = (mode, options) => ({
	lex() {
		const item = this.tokenizer.next();
		const tk = item.value;
		const tkType = tk.originalType;
		const text = tk.value;

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
			this.yylineno = tk.loc.start.row - 1;
		}

		return tkType;
	},

	setInput(source) {
		const tokenizer = mode.tokenizer(options);
		let previousPhases = [tokenizer];
		const phases = [tokenizer]
			.concat(mode.lexerPhases.map(phase => {
				const ph = phase(options, mode, previousPhases);
				previousPhases = previousPhases.concat(ph);
				return ph;
			}));

		const tokenize = compose.apply(null, phases.reverse());
		this.tokenizer = tokenize(source);
	}
});

module.exports = posixShellLexer;
