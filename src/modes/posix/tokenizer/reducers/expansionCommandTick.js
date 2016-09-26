'use strict';

import last from 'array-last';

export default function expansionCommandTick(state, char) {
	const xp = last(state.expansion);
	if (!state.escaping && char === '`') {
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
		nextReduction: expansionCommandTick,
		nextState: {...state, current: state.current + char, expansion}
	};
}
