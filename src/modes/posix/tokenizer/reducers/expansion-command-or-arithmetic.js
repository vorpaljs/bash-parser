'use strict';

const last = require('array-last');
const {continueToken} = require('../../../../utils/tokens');

module.exports = function expansionCommandOrArithmetic(state, source) {
	const expansionArithmetic = require('./expansion-arithmetic');

	const char = source && source.shift();
	const xp = last(state.expansion);

	if (char === '(' && state.current.slice(-2) === '$(') {
		return {
			nextReduction: expansionArithmetic,
			nextState: state.appendChar(char)
		};
	}

	if (char === undefined) {
		return {
			nextReduction: state.previousReducer,
			tokensToEmit: [continueToken('$(')],
			nextState: state.replaceLastExpansion({
				loc: Object.assign({}, xp.loc, {end: state.loc.previous})
			})
		};
	}

	if (char === ')') {
		return {
			nextReduction: state.previousReducer,
			nextState: state.appendChar(char).replaceLastExpansion({
				type: 'command_expansion',
				loc: Object.assign({}, xp.loc, {
					end: state.loc.current
				})
			})
		};
	}

	return {
		nextReduction: expansionCommandOrArithmetic,
		nextState: state.appendChar(char).replaceLastExpansion({command: (xp.command || '') + char})
	};
};
