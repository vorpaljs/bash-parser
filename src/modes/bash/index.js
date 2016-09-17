'use strict';

const bashAliasSubstitution = require('./rules/alias-substitution');

module.exports = {
	inherits: 'posix',
	init: posixMode => {
		const phaseCatalog = Object.assign(
			{},
			posixMode.phaseCatalog,
			{bashAliasSubstitution}
		);

		const lexerPhases = posixMode.lexerPhases.map(phase => {
			if (phase === phaseCatalog.aliasSubstitution) {
				return bashAliasSubstitution;
			}
			return phase;
		});

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
