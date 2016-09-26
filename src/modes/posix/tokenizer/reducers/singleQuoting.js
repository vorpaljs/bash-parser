'use strict';

import {tokenOrEmpty} from '..';
import start from './start';

export default function singleQuoting(state, char) {
	if (char === undefined) {
		return {
			nextReduction: null,
			tokensToEmit: tokenOrEmpty(state).concat({
				type: 'CONTINUE',
				value: ''
			})
		};
	}

	if (char === '\'') {
		return {
			nextReduction: start,
			nextState: {...state, current: state.current + char}
		};
	}

	return {
		nextReduction: singleQuoting,
		nextState: {...state, current: state.current + char}
	};
}
