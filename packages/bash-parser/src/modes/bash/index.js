'use strict';

const bashAliasSubstitution = require('./rules/alias-substitution');

const name = '[a-zA-Z_][a-zA-Z0-9_]*';

const parameterOperators = {
	// This is referred to as Substring Expansion.
	// It expands to up to length characters of the value
	// of parameter starting at the character specified by offset.
	[`^(${name}):([^:]*):?([^:]*)$`]: {
		op: 'substring',
		parameter: m => m[1],
		offset: m => parseInt(m[2], 10),
		length: m => parseInt(m[3], 10) || undefined
	},

	// Expands to the names of variables whose names begin with prefix,
	// separated by the first character of the IFS special variable.
	// When ‘@’ is used and the expansion appears within double quotes,
	// each variable name expands to a separate word.
	// TODO: @ case may need some investigation, maybe it's not actually possible
	[`^!(${name})(\\*|@)$`]: {
		op: 'prefix',
		prefix: m => m[1],
		expandWords: m => m[2] === '@',
		parameter: () => undefined
	},

	// Parameter is expanded and the longest match of pattern against its
	// value is replaced with string. If pattern begins with ‘/’, all matches
	// of pattern are replaced with string.
	[`^(${name})\\/(\\/)?([^\\/])+\\/(.*)$`]: {
		op: 'stringReplace',
		parameter: m => m[1],
		substitute: m => m[3],
		replace: m => m[4],
		globally: m => m[2] === '/'
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
