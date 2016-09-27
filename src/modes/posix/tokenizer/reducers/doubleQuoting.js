'use strict';

import start from './start';
import expansionStart from './expansionStart';
import expansionCommandTick from './expansionCommandTick';

import {tokenOrEmpty, appendEmptyExpansion, continueToken} from '..';

export default function doubleQuoting(state, char) {
	if (char === undefined) {
		return {
			nextReduction: null,
			tokensToEmit: tokenOrEmpty(state).concat(continueToken('"'))
		};
	}

	if (!state.escaping && char === '\\') {
		return {
			nextReduction: doubleQuoting,
			nextState: {
				...state,
				previousReducer: doubleQuoting,
				escaping: true,
				current: state.current + char
			}

		};
	}

	if (!state.escaping && char === '"') {
		return {
			nextReduction: start,
			nextState: {
				...state,
				previousReducer: start,
				current: state.current + char
			}
		};
	}

	if (!state.escaping && char === '$') {
		const expansion = appendEmptyExpansion(state);

		return {
			nextReduction: expansionStart,
			nextState: {
				...state,
				previousReducer: doubleQuoting,
				current: state.current + char,
				expansion
			}
		};
	}

	if (!state.escaping && char === '`') {
		const expansion = appendEmptyExpansion(state);

		return {
			nextReduction: expansionCommandTick,
			nextState: {
				...state,
				previousReducer: doubleQuoting,
				current: state.current + char,
				expansion
			}
		};
	}

	return {
		nextReduction: doubleQuoting,
		nextState: {
			...state,
			previousReducer: doubleQuoting,
			escaping: false,
			current: state.current + char
		}
	};
}
