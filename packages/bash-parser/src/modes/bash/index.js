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
	},

	// The expansion is either a transformation of the value of parameter or information about
	// parameter itself, depending on the value of operator. Each operator is a single letter:
	//
	// Q - The expansion is a string that is the value of parameter quoted in a format that can
	// 	be reused as input.
	// E - The expansion is a string that is the value of parameter with backslash escape
	// 	sequences expanded as with the $'…' quoting mechansim.
	// P - The expansion is a string that is the result of expanding the value of parameter
	// 	as if it were a prompt string (see Controlling the Prompt).
	// A - The expansion is a string in the form of an assignment statement or declare command
	// 	that, if evaluated, will recreate parameter with its attributes and value.
	// a - The expansion is a string consisting of flag values representing parameter’s attributes.
	//
	// If parameter is ‘@’ or ‘*’, the operation is applied to each positional parameter in turn,
	// and the expansion is the resultant list. If parameter is an array variable subscripted
	// with ‘@’ or ‘*’, the operation is applied to each member of the array in turn, and the
	// expansion is the resultant list.
	// The result of the expansion is subject to word splitting and pathname expansion as
	// described below.
	[`^(${name})@([Q|E|P|A|a])$`]: {
		op: 'transformation',
		parameter: m => m[1],
		kind: m => {
			switch (m[2]) {
				case 'Q': return 'quoted';
				case 'E': return 'escape';
				case 'P': return 'prompt';
				case 'A': return 'assignment';
				case 'a': return 'flags';
				default: return 'unknown';
			}
		}
	},

	// If the first character of parameter is an exclamation point (!), and parameter is not
	// a nameref, it introduces a level of variable indirection. Bash uses the value of the
	// variable formed from the rest of parameter as the name of the variable; this variable
	// is then expanded and that value is used in the rest of the substitution, rather than
	// the value of parameter itself. This is known as indirect expansion. If parameter is a
	// nameref, this expands to the name of the variable referenced by parameter instead of
	// performing the complete indirect expansion. The exceptions to this are the expansions
	// of ${!prefix*} and ${!name[@]} described below. The exclamation point must immediately
	// follow the left brace in order to introduce indirection.
	[`^!(.+)$`]: {
		op: 'indirection',
		word: m => m[1],
		parameter: () => undefined
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
