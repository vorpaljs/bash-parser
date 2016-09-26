'use strict';

import last from 'array-last';
import expansionArithmetic from './expansionArithmetic';

export default function expansionCommandOrArithmetic(state, char) {
	const xp = last(state.expansion);
	if (char === '(' && state.current.slice(-2) === '$(') {
		return {
			nextReduction: expansionArithmetic,
			nextState: {...state, current: state.current + char}
		};
	}

	if (char === ')') {
		const newXp = {
			...xp,
			type: 'COMMAND',
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
		value: (xp.value || '') + char
	};

	const expansion = state.expansion
			.slice(0, -1)
			.concat(newXp);

	return {
		nextReduction: expansionCommandOrArithmetic,
		nextState: {...state, current: state.current + char, expansion}
	};
}
