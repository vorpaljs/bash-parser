import utils from '../../utils/index';
import astBuilder from './ast-builder';
import tokenizer from './tokenizer/index';
import * as phaseCatalog from './rules/index';
import grammarSource from './grammar';
import * as enums from './enums/index';

const lexerPhases = () => [
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
	phaseCatalog.commandExpansion,
	phaseCatalog.forNameVariable,
	phaseCatalog.functionName,
	phaseCatalog.identifySimpleCommandNames,
	// utils.loggerPhase('pre'),
	phaseCatalog.aliasSubstitution,
	// utils.loggerPhase('post'),
	phaseCatalog.tildeExpanding,
	phaseCatalog.parameterExpansion.resolve,
	phaseCatalog.commandExpansion.resolve,
	phaseCatalog.arithmeticExpansion.resolve,
	phaseCatalog.fieldSplitting.split,
	phaseCatalog.pathExpansion,
	phaseCatalog.quoteRemoval,
	phaseCatalog.syntaxerrorOnContinue,
	phaseCatalog.defaultNodeType
	// utils.loggerPhase('tokenizer'),
];

export default {
	inherits: null,
	init: () => {
		let grammar = null;
		try {
			grammar = require('./built-grammar-posix');
		} catch (err) {}

		return {
			enums,
			phaseCatalog,
			lexerPhases: lexerPhases(utils),
			tokenizer,
			grammarSource,
			grammar,
			astBuilder
		};
	}
};
