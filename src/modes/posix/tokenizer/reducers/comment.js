'use strict';

const {newLine} = require('../../../../utils/tokens');

module.exports = function comment(state, source) {
	const end = require('./end');
	const start = require('./start');

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
};
