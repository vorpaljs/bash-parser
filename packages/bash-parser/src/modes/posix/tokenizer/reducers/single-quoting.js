import {tokens as t} from '../../../../utils/index';

const tokenOrEmpty = t.tokenOrEmpty;
const continueToken = t.continueToken;

export default function singleQuoting(state, source, reducers) {
	const char = source && source.shift();

	if (char === undefined) {
		return {
			nextState: state,
			nextReduction: null,
			tokensToEmit: tokenOrEmpty(state).concat(continueToken('\''))
		};
	}

	if (char === '\'') {
		return {
			nextReduction: reducers.start,
			nextState: state.appendChar(char)
		};
	}

	return {
		nextReduction: reducers.singleQuoting,
		nextState: state.appendChar(char)
	};
}
