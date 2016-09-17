// @flow

export type Token = Object;

type LexerPhase = (options: Object) =>(tokens: Iterable<Token>) => Iterable<Token>;

export type Mode = {
	tokenizer: (code: String) => Iterable<Token>,
	lexerPhases: Array<LexerPhase>,
	grammar: Object,
	grammarSource: Object,
	astBuilder: Object,
};

export type ModePlugin = {
	inherits?: string,
	init: (parentMode: ModePlugin) => Mode
};
