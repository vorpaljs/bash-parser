'use strict';

import end from './end';
import start from './start';

import {operatorTokens, isPartOfOperator, isOperator} from '..';

export default function operator(state, source) {
	const char = source && source.shift();


	if (char === undefined) {
		if (isOperator(state.current)) {
			return {
				nextReduction: end,
				tokensToEmit: operatorTokens(state),
				nextState: state.resetCurrent().saveCurrentLocAsStart()
			};
		}
		return start(state, char);
	}

	if (isPartOfOperator(state.current + char)) {
		return {
			nextReduction: operator,
			nextState: state.appendChar(char)
		};
	}

	let tokens = [];
	if (isOperator(state.current)) {
		tokens = operatorTokens(state);
		state = state.resetCurrent().saveCurrentLocAsStart();
	}

	const {nextReduction, tokensToEmit, nextState} = start(state, [char].concat(source));
	if (tokensToEmit) {
		tokens = tokens.concat(tokensToEmit);
	}
	return {
		nextReduction: nextReduction,
		tokensToEmit: tokens,
		nextState
	};
}
