'use strict';

const {isSpecialParameter} = require('../../../../utils/tokens');

module.exports = function expansionStart(state, source) {
	const expansionSpecialParameter = require('./expansion-special-parameter');
	const expansionParameter = require('./expansion-parameter');
	const expansionCommandOrArithmetic = require('./expansion-command-or-arithmetic');
	const expansionParameterExtended = require('./expansion-parameter-extended');

	const char = source && source.shift();

	if (char === '{') {
		return {
			nextReduction: expansionParameterExtended,
			nextState: state.appendChar(char)
		};
	}

	if (char === '(') {
		return {
			nextReduction: expansionCommandOrArithmetic,
			nextState: state.appendChar(char)
		};
	}

	if (char.match(/[a-zA-Z_]/)) {
		return {
			nextReduction: expansionParameter,
			nextState: state.appendChar(char).replaceLastExpansion({
				parameter: char,
				type: 'parameter_expansion'
			})
		};
	}

	if (isSpecialParameter(char)) {
		return expansionSpecialParameter(state, [char].concat(source));
	}

	return state.previousReducer(state, [char].concat(source));
};
