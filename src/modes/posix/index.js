'use strict';
// @flow
/* flow-include import type {ModePlugin} from '../plugin'; */

const astBuilder = require('./ast-builder');
const tokenizer = require('./tokenizer').default;
const phaseCatalog = require('./rules');
const grammarSource = require('./grammar');

const lexerPhases = (utils) => [
	// utils.loggerPhase('tokenizer'),
	phaseCatalog.newLineList,
	phaseCatalog.operatorTokens,
	phaseCatalog.separator,
	phaseCatalog.reservedWords,
	phaseCatalog.linebreakIn,
	phaseCatalog.ioNumber,
	phaseCatalog.identifyMaybeSimpleCommands,
	phaseCatalog.assignmentWord,
	phaseCatalog.parameterExpansion,
	phaseCatalog.arithmeticExpansion,
	//phaseCatalog.commandExpansion,
	// utils.loggerPhase('commandExpansion'),
	phaseCatalog.forNameVariable,
	// utils.loggerPhase('for'),
	phaseCatalog.functionName,
	phaseCatalog.identifySimpleCommandNames,
	phaseCatalog.aliasSubstitution,
	phaseCatalog.tildeExpanding,
	phaseCatalog.parameterExpansion.resolve,
	phaseCatalog.commandExpansion.resolve,
	phaseCatalog.arithmeticExpansion.resolve,
	phaseCatalog.fieldSplitting.split,
	phaseCatalog.pathExpansion,
	phaseCatalog.quoteRemoval,
	phaseCatalog.defaultNodeType,
	phaseCatalog.removeTempObject
];

module.exports = {
	inherits: null,
	init: (posixMode, utils) => {
		let grammar = null;
		try {
			grammar = require('./built-grammar');
		} catch (err) {}
		return {
			phaseCatalog,
			lexerPhases: lexerPhases(utils),
			tokenizer,
			grammarSource,
			grammar,
			astBuilder
		};
	}
};
