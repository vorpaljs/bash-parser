'use strict';

const t = require('../../../../utils/tokens');

const isPartOfOperator = t.isPartOfOperator;
const operatorTokens = t.operatorTokens;
const isOperator = t.isOperator;

module.exports = function operator(state, source, reducers) {
	const char = source && source.shift();

	// console.log('isOperator ', {state,char})

	if (char === undefined) {
		if (isOperator(state.current)) {
			return {
				nextReduction: reducers.end,
				tokensToEmit: operatorTokens(state),
				nextState: state.resetCurrent().saveCurrentLocAsStart()
			};
		}
		return reducers.start(state, char);
	}

	if (isPartOfOperator(state.current + char)) {
		return {
			nextReduction: reducers.operator,
			nextState: state.appendChar(char)
		};
	}

	let tokens = [];
	if (isOperator(state.current)) {
		// console.log('isOperator ', state.current)
		tokens = operatorTokens(state);
		state = state.resetCurrent().saveCurrentLocAsStart();
	}

	const ret = reducers.start(state, [char].concat(source), reducers);
	const nextReduction = ret.nextReduction;
	const tokensToEmit = ret.tokensToEmit;
	const nextState = ret.nextState;

	if (tokensToEmit) {
		tokens = tokens.concat(tokensToEmit);
	}
	return {
		nextReduction: nextReduction,
		tokensToEmit: tokens,
		nextState
	};
};
