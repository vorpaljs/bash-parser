'use strict';

const last = require('array-last');
const t = require('../../../../utils/tokens');

const continueToken = t.continueToken;

module.exports = function expansionCommandOrArithmetic(state, source, reducers) {
	const char = source && source.shift();
	const xp = last(state.expansion);

	if (char === '(' && state.current.slice(-2) === '$(') {
		return {
			nextReduction: reducers.expansionArithmetic,
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
		nextReduction: reducers.expansionCommandOrArithmetic,
		nextState: state.appendChar(char).replaceLastExpansion({command: (xp.command || '') + char})
	};
};
