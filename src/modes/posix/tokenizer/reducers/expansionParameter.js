'use strict';

import last from 'array-last';

export default function expansionParameter(state, char) {
	const xp = last(state.expansion);
	if (char.match(/[0-9a-zA-Z_]/)) {
		const newXp = {...xp, value: xp.value + char};
		const expansion = state.expansion
			.slice(0, -1)
			.concat(newXp);

		return {
			nextReduction: expansionParameter,
			nextState: {...state, current: state.current + char, expansion}
		};
	}
	const newXp = {...xp, loc: {...xp.loc, end: state.loc.previous}};
	const expansion = state.expansion
		.slice(0, -1)
		.concat(newXp);

	return state.previousReducer({...state, expansion}, char);
}
