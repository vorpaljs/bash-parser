'use strict';

import {eof} from '..';

export default function end() {
	return {
		nextReduction: null,
		tokensToEmit: [eof()]
	};
}
