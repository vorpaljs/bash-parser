import last from 'array-last';
import {tokens as t} from '../../../../utils/index';

const continueToken = t.continueToken;

export default function expansionParameterExtended(state, source, reducers) {
	const char = source && source.shift();

	const xp = last(state.expansion);

	if (char === '}') {
		return {
			nextReduction: state.previousReducer,
			nextState: state.appendChar(char).replaceLastExpansion({
				type: 'parameter_expansion',
				loc: Object.assign({}, xp.loc, {end: state.loc.current})
			})
		};
	}

	if (char === undefined) {
		return {
			nextReduction: state.previousReducer,
			tokensToEmit: [continueToken('${')],
			nextState: state.replaceLastExpansion({
				loc: Object.assign({}, xp.loc, {end: state.loc.previous})
			})
		};
	}

	return {
		nextReduction: reducers.expansionParameterExtended,
		nextState: state
			.appendChar(char)
			.replaceLastExpansion({parameter: (xp.parameter || '') + char})
	};
}
