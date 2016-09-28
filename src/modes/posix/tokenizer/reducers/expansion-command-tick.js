'use strict';

import last from 'array-last';
import {continueToken} from '..';

export default function expansionCommandTick(state, char) {
	const xp = last(state.expansion);
	if (!state.escaping && char === '`') {
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
			tokensToEmit: [continueToken('`')],
			nextState: state.setExpansion(expansion)
		};
	}

	if (!state.escaping && char === '\\') {
		return {
			nextReduction: expansionCommandTick,
			nextState: state.appendChar(char).setEscaping(true)

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
		nextReduction: expansionCommandTick,
		nextState: state.setEscaping(false).appendChar(char).setExpansion(expansion)
	};
}
