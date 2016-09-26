'use strict';

import last from 'array-last';

export default function expansionArithmetic(state, char) {
	const xp = last(state.expansion);

	if (char === ')' && state.current.slice(-1)[0] === ')') {
		const newXp = {
			...xp,
			type: 'arithmetic_expansion',
			expression: xp.value.slice(0, -1),
			loc: {...xp.loc, end: state.loc.current}
		};
		delete newXp.value;

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
		nextReduction: expansionArithmetic,
		nextState: {...state, current: state.current + char, expansion}
	};
}
