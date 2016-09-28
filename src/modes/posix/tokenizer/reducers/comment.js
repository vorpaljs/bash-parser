'use strict';

import end from './end';
import start from './start';
import {newLine} from '..';

export default function comment(state, source) {
	const char = source && source.shift();


	if (char === undefined) {
		return {
			nextReduction: end,
			nextState: state
		};
	}

	if (char === '\n') {
		return {
			tokensToEmit: [newLine()],
			nextReduction: start,
			nextState: state
		};
	}

	return {
		nextReduction: comment,
		nextState: state
	};
}
