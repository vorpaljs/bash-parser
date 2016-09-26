'use strict';

import end from './end';
import start from './start';

import {operatorTokens, isPartOfOperator, isOperator} from '..';

export default function operator(state, char) {
	if (char === undefined) {
		if (isOperator(state.current)) {
			return {
				nextReduction: end,
				tokensToEmit: operatorTokens(state),
				nextState: {...state, current: '', loc: {...state.loc, start: state.loc.current}}
			};
		}
		return start(state, char);
	}

	if (isPartOfOperator(state.current + char)) {
		return {
			nextReduction: operator,
			nextState: {...state, current: state.current + char}
		};
	}

	let tokens = [];
	if (isOperator(state.current)) {
		tokens = operatorTokens(state);
		state = {...state, current: '', loc: {...state.loc, start: state.loc.current}};
	}

	const {nextReduction, tokensToEmit, nextState} = start(state, char);
	if (tokensToEmit) {
		tokens = tokens.concat(tokensToEmit);
	}
	return {
		nextReduction: nextReduction,
		tokensToEmit: tokens,
		nextState
	};
}
