'use strict';
// @flow
/* flow-include import type {ModePlugin} from '../plugin'; */

const astBuilder = require('./ast-builder');
const tokenizer = require('./token-delimiter');
const phaseCatalog = require('./rules');
const grammarSource = require('./grammar');
const grammar = require('./built-grammar');

const lexerPhases = [
	phaseCatalog.removeTempObject,
	phaseCatalog.defaultNodeType,
	phaseCatalog.quoteRemoval,
	phaseCatalog.pathExpansion,
	phaseCatalog.fieldSplitting.split,
	phaseCatalog.arithmeticExpansion.resolve,
	phaseCatalog.commandExpansion.resolve,
	phaseCatalog.parameterExpansion.resolve,
	phaseCatalog.tildeExpanding,
	phaseCatalog.aliasSubstitution,
	phaseCatalog.identifySimpleCommandNames,
	phaseCatalog.functionName,
	phaseCatalog.forNameVariable,
	phaseCatalog.commandExpansion,
	phaseCatalog.arithmeticExpansion,
	phaseCatalog.parameterExpansion,
	phaseCatalog.assignmentWord,
	phaseCatalog.identifyMaybeSimpleCommands,
	phaseCatalog.ioNumber,
	phaseCatalog.linebreakIn,
	phaseCatalog.reservedWords,
	phaseCatalog.separator,
	phaseCatalog.operatorTokens,
	phaseCatalog.newLineList
];

module.exports = {
	inherits: null,
	init: () => ({
		phaseCatalog,
		lexerPhases,
		tokenizer,
		grammarSource,
		grammar,
		astBuilder
	})
};
