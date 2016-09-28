'use strict';

const {tokenOrEmpty, continueToken} = require('../../../../utils/tokens');

module.exports = function singleQuoting(state, source) {
	const start = require('./start');

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
};
