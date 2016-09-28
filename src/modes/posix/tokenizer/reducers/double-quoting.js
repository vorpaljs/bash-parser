'use strict';

const {tokenOrEmpty, continueToken} = require('../../../../utils/tokens');

module.exports = function doubleQuoting(state, source) {
	const start = require('./start');
	const expansionStart = require('./expansion-start');
	const expansionCommandTick = require('./expansion-command-tick');

	const char = source && source.shift();

	state = state.setPreviousReducer(doubleQuoting);

	if (char === undefined) {
		return {
			nextReduction: null,
			tokensToEmit: tokenOrEmpty(state).concat(continueToken('"')),
			nextState: state
		};
	}

	if (!state.escaping && char === '\\') {
		return {
			nextReduction: doubleQuoting,
			nextState: state.setEscaping(true).appendChar(char)
		};
	}

	if (!state.escaping && char === '"') {
		return {
			nextReduction: start,
			nextState: state.setPreviousReducer(start).appendChar(char)
		};
	}

	if (!state.escaping && char === '$') {
		return {
			nextReduction: expansionStart,
			nextState: state.appendEmptyExpansion().appendChar(char)
		};
	}

	if (!state.escaping && char === '`') {
		return {
			nextReduction: expansionCommandTick,
			nextState: state.appendEmptyExpansion().appendChar(char)
		};
	}

	return {
		nextReduction: doubleQuoting,
		nextState: state.setEscaping(false).appendChar(char)
	};
};
