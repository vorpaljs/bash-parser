'use strict';
// @flow
/* flow-include import type {ModePlugin} from '../plugin'; */

const tokenizer = require('../../token-delimiter');
const rules = require('../../tokenization-rules');
const parameterExpansion = require('../../parameter-expansion');
const commandExpansion = require('../../command-expansion');
const arithmeticExpansion = require('../../arithmetic-expansion');
const aliasSubstitution = require('../../alias-substitution');
const defaultNodeType = require('../../default-node-type');
const fieldSplitting = require('../../field-splitting');
const tildeExpanding = require('../../tilde-expanding');
const pathExpansion = require('../../path-expansion');
const quoteRemoval = require('../../quote-removal');
const astBuilder = require('../../ast-builder');
// const logger = require('../../logger-iterator');

const grammarSource = require('./grammar');
const grammar = require('./built-grammar');

const lexerPhases = [
	rules.removeTempObject,
	defaultNodeType,
	quoteRemoval,
	pathExpansion,
	fieldSplitting.split,
	arithmeticExpansion.resolve,
	commandExpansion.resolve,
	parameterExpansion.resolve,
	tildeExpanding,
	aliasSubstitution,
	rules.identifySimpleCommandNames,
	rules.functionName,
	rules.forNameVariable,
	commandExpansion,
	arithmeticExpansion,
	parameterExpansion,
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
