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

	// If name is an array variable, expands to the list of array indices
	// (keys) assigned in name. If name is not an array, expands to 0 if
	// name is set and null otherwise. When ‘@’ is used and the expansion
	// appears within double quotes, each key expands to a separate word.
	// TODO: @ case may need some investigation, maybe it's not actually possible
	[`^!(${name})(\\[\\*\\]|\\[@\\])$`]: {
		op: 'arrayIndices',
		parameter: m => m[1],
		expandWords: m => m[2] === '[@]'
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
	},

	// This expansion modifies the case of alphabetic characters in parameter.
	// The pattern is expanded to produce a pattern just as in filename expansion.
	// Each character in the expanded value of parameter is tested against pattern,
	// and, if it matches the pattern, its case is converted. The pattern should
	// not attempt to match more than one character. The ‘^’ operator converts
	// lowercase letters matching pattern to uppercase; the ‘,’ operator converts
	// matching uppercase letters to lowercase. The ‘^^’ and ‘,,’ expansions convert
	// each matched character in the expanded value; the ‘^’ and ‘,’ expansions match
	// and convert only the first character in the expanded value. If pattern is omitted,
	// it is treated like a ‘?’, which matches every character. If parameter is ‘@’
	// or ‘*’, the case modification operation is applied to each positional parameter
	// in turn, and the expansion is the resultant list. If parameter is an array variable
	// subscripted with ‘@’ or ‘*’, the case modification operation is applied to each
	// member of the array in turn, and the expansion is the resultant list.
	[`^(${name})(\\^\\^|\\^|,,|,)(.*)$`]: {
		op: 'caseChange',
		parameter: m => m[1],
		pattern: m => m[3] || '?',
		case: m => m[2][0] === ',' ? 'lower' : 'upper',
		globally: m => m[2].length === 2
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
