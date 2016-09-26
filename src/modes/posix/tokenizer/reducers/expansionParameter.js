'use strict';

import last from 'array-last';
import start from './start';

export default function expansionParameter(state, char) {
	const xp = last(state.expansion);

	if (char === undefined) {
		// console.log(state.loc, xp.loc)
		const newXp = {
			...xp,
			loc: {...xp.loc, end: state.loc.current}
		};
		// console.log(newXp)
		const expansion = state.expansion
			.slice(0, -1)
			.concat(newXp);

		return {
			nextReduction: start,
			nextState: {...state, expansion}
		};
	}

	if (char.match(/[0-9a-zA-Z_]/)) {
		const newXp = {
			...xp,
			parameter: xp.value + (char || '')
		};
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
