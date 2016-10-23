'use strict';

const bashAliasSubstitution = require('./rules/alias-substitution');

const name = '[a-zA-Z_][a-zA-Z0-9_]*';
const parameterOperators = {
	[`^(${name}):(.*):(.*)$`]: {
		op: 'substring',
		parameter: m => m[1],
		offset: m => parseInt(m[2], 10),
		length: m => parseInt(m[3], 10)
	}
};

module.exports = {
	inherits: 'posix',
	init: (posixMode, utils) => {
		const phaseCatalog = Object.assign(
			{},
			posixMode.phaseCatalog,
			{bashAliasSubstitution}
		);

		const lexerPhases = utils.replaceRule(
			phaseCatalog.aliasSubstitution,
			bashAliasSubstitution,
			posixMode.lexerPhases
		);

		const bashOperators = Object.assign(
			parameterOperators,
			posixMode.enums.parameterOperators
		);

		const enums = Object.assign(
			{},
			posixMode.enums,
			{parameterOperators: bashOperators}
		);

		return Object.assign(
			{},
			posixMode,
			{phaseCatalog, lexerPhases, enums}
		);
	}
};
