'use strict';

import {tokenOrEmpty, continueToken} from '..';
import start from './start';

export default function singleQuoting(state, source) {
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
			nextReduction: start,
			nextState: state.appendChar(char)
		};
	}

	return {
		nextReduction: singleQuoting,
		nextState: state.appendChar(char)
	};
}
