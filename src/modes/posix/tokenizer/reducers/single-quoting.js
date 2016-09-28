'use strict';

import {tokenOrEmpty, continueToken} from '..';
import start from './start';

export default function singleQuoting(state, char) {
	if (char === undefined) {
		return {
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
