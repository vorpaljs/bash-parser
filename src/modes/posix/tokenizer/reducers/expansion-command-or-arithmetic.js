'use strict';

import last from 'array-last';
import {continueToken} from '..';
import expansionArithmetic from './expansion-arithmetic';

export default function expansionCommandOrArithmetic(state, source) {
	const char = source && source.shift();


	const xp = last(state.expansion);
	if (char === '(' && state.current.slice(-2) === '$(') {
		return {
			nextReduction: expansionArithmetic,
			nextState: state.appendChar(char)
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
			nextState: state.setExpansion(expansion)
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
			nextState: state.appendChar(char).setExpansion(expansion)
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
		nextState: state.appendChar(char).setExpansion(expansion)
	};
}
