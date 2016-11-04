import last from 'array-last';
import {tokens as t} from '../../../../utils/index';

const continueToken = t.continueToken;

export default function expansionCommandTick(state, source, reducers) {
	const char = source && source.shift();

	const xp = last(state.expansion);

	if (!state.escaping && char === '`') {
		return {
			nextReduction: state.previousReducer,
			nextState: state.appendChar(char).replaceLastExpansion({
				type: 'command_expansion',
				loc: Object.assign({}, xp.loc, {end: state.loc.current})
			})
		};
	}

	if (char === undefined) {
		return {
			nextReduction: state.previousReducer,
			tokensToEmit: [continueToken('`')],
			nextState: state.replaceLastExpansion({
				loc: Object.assign({}, xp.loc, {end: state.loc.previous})
			})
		};
	}

	if (!state.escaping && char === '\\') {
		return {
			nextReduction: reducers.expansionCommandTick,
			nextState: state.appendChar(char).setEscaping(true)
		};
	}

	return {
		nextReduction: reducers.expansionCommandTick,
		nextState: state
			.setEscaping(false)
			.appendChar(char)
			.replaceLastExpansion({command: (xp.command || '') + char})
	};
}
