'use strict';

import last from 'array-last';

export default function expansionSpecialParameter(state, char) {
	const xp = last(state.expansion);

	const newXp = {
		...xp,
		value: char,
		type: 'SPECIAL-PARAMETER',
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
