'use strict';
// @flow
/* flow-include import type {ModePlugin} from '../plugin'; */

const astBuilder = require('./ast-builder');
const tokenizer = require('./token-delimiter');
const posixRules = require('./rules');
const grammarSource = require('./grammar');
const grammar = require('./built-grammar');

const lexerPhases = [
	posixRules.removeTempObject,
	posixRules.defaultNodeType,
	posixRules.quoteRemoval,
	posixRules.pathExpansion,
	posixRules.fieldSplitting.split,
	posixRules.arithmeticExpansion.resolve,
	posixRules.commandExpansion.resolve,
	posixRules.parameterExpansion.resolve,
	posixRules.tildeExpanding,
	posixRules.aliasSubstitution,
	posixRules.identifySimpleCommandNames,
	posixRules.functionName,
	posixRules.forNameVariable,
	posixRules.commandExpansion,
	posixRules.arithmeticExpansion,
	posixRules.parameterExpansion,
	posixRules.assignmentWord,
	posixRules.identifyMaybeSimpleCommands,
	posixRules.ioNumber,
	posixRules.linebreakIn,
	posixRules.reservedWords,
	posixRules.separator,
	posixRules.operatorTokens,
	posixRules.newLineList
];

module.exports = {
	inherits: null,
	init: () => ({
		lexerPhases: lexerPhases,
		tokenizer: tokenizer,
		grammarSource: grammarSource,
		grammar: grammar,
		astBuilder: astBuilder
	})
};
