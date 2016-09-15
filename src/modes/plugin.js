// @flow

export type Token = Object;

type LexerPhase = (options: Object) =>(tokens: Iterable<Token>) => Iterable<Token>;

export type ModePlugin = {
	inherits?: string,
	tokenizer: (code: String) => Iterable<Token>,
	lexerPhases: Array<LexerPhase>,
	grammar: Object
};
