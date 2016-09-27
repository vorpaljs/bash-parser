'use strict';

import end from './end';
import start from './start';
import {newLine} from '..';

export default function comment(state, char) {
	if (char === undefined) {
		return {
			nextReduction: end
		};
	}

	if (char === '\n') {
		return {
			tokensToEmit: [newLine()],
			nextReduction: start
		};
	}

	return {
		nextReduction: comment
	};
}
