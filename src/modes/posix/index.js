'use strict';
// @flow
/* flow-include import type {ModePlugin} from '../plugin'; */

const astBuilder = require('./ast-builder');
const tokenizer = require('./token-delimiter');
const posixRules = require('./rules');

const rules = posixRules.rules;

const grammarSource = require('./grammar');
const grammar = require('./built-grammar');

const lexerPhases = [
	rules.removeTempObject,
	posixRules.defaultNodeType,
	posixRules.quoteRemoval,
	posixRules.pathExpansion,
	posixRules.fieldSplitting.split,
	posixRules.arithmeticExpansion.resolve,
	posixRules.commandExpansion.resolve,
	posixRules.parameterExpansion.resolve,
	posixRules.tildeExpanding,
	posixRules.aliasSubstitution,
	rules.identifySimpleCommandNames,
	rules.functionName,
	rules.forNameVariable,
	posixRules.commandExpansion,
	posixRules.arithmeticExpansion,
	posixRules.parameterExpansion,
	rules.assignmentWord,
	rules.identifyMaybeSimpleCommands,
	rules.ioNumber,
	rules.linebreakIn,
	rules.reservedWords,
	rules.separator,
	rules.operatorTokens,
	rules.newLineList
];

const plugin/* : ModePlugin*/ = {
	lexerPhases,
	tokenizer,
	grammarSource,
	grammar,
	astBuilder
};

module.exports = plugin;
