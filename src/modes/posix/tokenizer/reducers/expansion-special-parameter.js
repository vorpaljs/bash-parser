'use strict';

import last from 'array-last';

export default function expansionSpecialParameter(state, source) {
	const char = source && source.shift();

	const xp = last(state.expansion);

	const newXp = {
		...xp,
		parameter: char,
		type: 'parameter_expansion',
		loc: {...xp.loc, end: state.loc.current}
	};

	const expansion = state.expansion
		.slice(0, -1)
		.concat(newXp);

	return {
		nextReduction: state.previousReducer,
		nextState: state.appendChar(char).setExpansion(expansion)
	};
}
