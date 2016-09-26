'use strict';

import last from 'array-last';

export default function expansionParameterExtended(state, char) {
	const xp = last(state.expansion);

	if (char === '}') {
		const newXp = {
			...xp,
			type: 'parameter_expansion',
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
		nextReduction: expansionParameterExtended,
		nextState: {...state, current: state.current + char, expansion}
	};
}
