'use strict';

import last from 'array-last';
import {continueToken} from '..';
import expansionArithmetic from './expansionArithmetic';

export default function expansionCommandOrArithmetic(state, char) {
	const xp = last(state.expansion);
	if (char === '(' && state.current.slice(-2) === '$(') {
		return {
			nextReduction: expansionArithmetic,
			nextState: {...state, current: state.current + char}
		};
	}

	if (char === undefined) {
		const newXp = {
			...xp,
			loc: {...xp.loc, end: state.loc.previous}
		};

		const expansion = state.expansion
			.slice(0, -1)
			.concat(newXp);

		return {
			nextReduction: state.previousReducer,
			tokensToEmit: [continueToken('$(')],
			nextState: {...state, expansion}
		};
	}

	if (char === ')') {
		const newXp = {
			...xp,
			type: 'command_expansion',
			loc: {...xp.loc, end: state.loc.current}
		};
		const expansion = state.expansion
			.slice(0, -1)
			.concat(newXp);

		return {
			nextReduction: state.previousReducer,
			nextState: {...state, current: state.current + char, expansion}
		};
	}

	const newXp = {
		...xp,
		command: (xp.command || '') + char
	};

	const expansion = state.expansion
			.slice(0, -1)
			.concat(newXp);

	return {
		nextReduction: expansionCommandOrArithmetic,
		nextState: {...state, current: state.current + char, expansion}
	};
}
