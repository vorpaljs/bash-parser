'use strict';

import last from 'array-last';
import start from './start';

export default function expansionParameter(state, char) {
	const xp = last(state.expansion);

	if (char === undefined) {
		// console.log(state.loc, xp.loc)
		const newXp = {
			...xp,
			loc: {...xp.loc, end: state.loc.previous}
		};
		// console.log(newXp)
		const expansion = state.expansion
			.slice(0, -1)
			.concat(newXp);

		return {
			nextReduction: start,
			nextState: state.setExpansion(expansion)
		};
	}

	if (char.match(/[0-9a-zA-Z_]/)) {
		const newXp = {
			...xp,
			parameter: xp.parameter + (char || '')
		};
		const expansion = state.expansion
			.slice(0, -1)
			.concat(newXp);

		return {
			nextReduction: expansionParameter,
			nextState: state.appendChar(char).setExpansion(expansion)
		};
	}

	const newXp = {...xp, loc: {...xp.loc, end: state.loc.previous}};
	const expansion = state.expansion
		.slice(0, -1)
		.concat(newXp);

	return state.previousReducer(state.setExpansion(expansion), char);
}
