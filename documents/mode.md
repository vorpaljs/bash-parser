# Mode plugins internal API

The parser is able to parse different shell flavours by using `mode` plugins. By now, the `posix` mode is almost complete, and we are implementing the `bash` mode.

This document describe how a mode shall be defined. This is for now an internal API, it's possible that in future release this API will be exposed as a public one to allow the use of external defined modes.

In this document we use flow syntax to define the type of expected object, but this only for documentation purpose, types are not checked at runtime in any way.

## `init` function

A mode plugin consist of a module in `src/modes` folder. The module must exports
a `ModePlugin` object with an optional `inherits` property and a required `init` factory function.

```flow
type ModePlugin = {
	inherits?: string,
	init: (parentMode: Mode) => Mode
};
```

## `Mode` object

A mode could optionally inherit an existing one. It specify the mode to inherit in its
`inherits` property. If it does, the `init` function will receive as argument the inherited mode. In this way the child mode could use the parent mode features.

The `init` function must return a `Mode` object.

```
export type Mode = {
	tokenizer: (options: Object, utils: Object) => (code: String) => Iterable<Token>,
	lexerPhases: Array<LexerPhase>,
	phaseCatalog: {[id:string]: LexerPhase}
	grammar: Object,
	grammarSource: Object,
	astBuilder: Object,
};

A `Mode` object consists has the following properties:

* tokenizer - a function that receive parser options and utils object as argument, and return another function that, given shell source code, return an iterable oif parsed tokens.

* lexerPhases - an array of transform functions that are applied, in order, to the iterable of tokens returned by the `tokenizer` function. Each phase must have the `LexerPhase` type described below.

* phaseCatalog - a named map of all phases contained in the array. This could be used by children modes to access each phase by name and reuse them.

* grammar - the grammar compiled function. This is usually imported from a Jison grammar, compiled using the `mode-grammar-builder` cli.

* grammarSource - an object that describe the grammar, must be in the JSON format supported by Jison. This object could be reused by children modes and is read by the `mode-grammar-builder` cli to build the compiled grammar.

* astBuilder - an object containing methods to build the final AST. This object is mixed-in in the Jison grammar, and any of its methods could be called directly from grammar EBNF source.


## `LexerPhase` functions

`LexerPhase` functions are applyed, in order, to the iterable returned from `tokenizer` function. Each phase enhance or alter the tokens to produce a final token iterable, directly consumable by the grammar parser.

Each phase is a function that accept as arguments the parser option object,
an array of all phases that precede it in the pipeline, and the utils object. The function shall return another function that receive as argument the iterable produced by the previous phase, and return the iterable to give to the subsequent one.

```flow
export type Token = Object;

type LexerPhase = (options: Object, previousPhases: Array<LexerPhase>,utils: Object) =>
	(tokens: Iterable<Token>) => Iterable<Token>;
```


## `utils` object.

This is an object containing various help methods  that simplify the implementation of token phases.
