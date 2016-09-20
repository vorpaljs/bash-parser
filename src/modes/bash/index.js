'use strict';

const replaceRule = require('../../../packages/array-replace-item');
const bashAliasSubstitution = require('./rules/alias-substitution');

module.exports = {
	inherits: 'posix',
	init: posixMode => {
		const phaseCatalog = Object.assign(
			{},
			posixMode.phaseCatalog,
			{bashAliasSubstitution}
		);

		const lexerPhases = replaceRule(
			phaseCatalog.aliasSubstitution,
			bashAliasSubstitution,
			posixMode.lexerPhases
		);

		return {
			phaseCatalog,
			lexerPhases,
			tokenizer: posixMode.tokenizer,
			grammarSource: posixMode.grammarSource,
			grammar: posixMode.grammar,
			astBuilder: posixMode.astBuilder
		};
	}
};
