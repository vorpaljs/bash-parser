'use strict';

const {tokenOrEmpty, newLine, isPartOfOperator} = require('../../../../utils/tokens');

const end = require('./end');
const operator = require('./operator');
const comment = require('./comment');
const singleQuoting = require('./single-quoting');
const doubleQuoting = require('./double-quoting');
const expansionStart = require('./expansion-start');
const expansionCommandTick = require('./expansion-command-tick');

module.exports = function start(state, source) {
	const char = source && source.shift();

	if (char === undefined) {
		return {
			nextReduction: end,
			tokensToEmit: tokenOrEmpty(state),
			nextState: state.resetCurrent().saveCurrentLocAsStart()
		};
	}

	if (state.escaping && char === '\n') {
		return {
			nextReduction: start,
			nextState: state.setEscaping(false).removeLastChar()
		};
	}

	if (!state.escaping && char === '#' && state.current === '') {
		return {
			nextReduction: comment
		};
	}

	if (!state.escaping && char === '\n') {
		return {
			nextReduction: start,
			tokensToEmit: tokenOrEmpty(state).concat(newLine()),
			nextState: state.resetCurrent().saveCurrentLocAsStart()
		};
	}

	if (!state.escaping && char === '\\') {
		return {
			nextReduction: start,
			nextState: state.setEscaping(true).appendChar(char)
		};
	}

	if (!state.escaping && isPartOfOperator(char)) {
		return {
			nextReduction: operator,
			tokensToEmit: tokenOrEmpty(state),
			nextState: state.setCurrent(char).saveCurrentLocAsStart()
		};
	}

	if (!state.escaping && char === '\'') {
		return {
			nextReduction: singleQuoting,
			nextState: state.appendChar(char)
		};
	}

	if (!state.escaping && char === '"') {
		return {
			nextReduction: doubleQuoting,
			nextState: state.appendChar(char)
		};
	}

	if (!state.escaping && char.match(/\s/)) {
		return {
			nextReduction: start,
			tokensToEmit: tokenOrEmpty(state),
			nextState: state.resetCurrent().saveCurrentLocAsStart().setExpansion([])
		};
	}

	if (!state.escaping && char === '$') {
		return {
			nextReduction: expansionStart,
			nextState: state.appendChar(char).appendEmptyExpansion()
		};
	}

	if (!state.escaping && char === '`') {
		return {
			nextReduction: expansionCommandTick,
			nextState: state.appendChar(char).appendEmptyExpansion()
		};
	}

	return {
		nextReduction: start,
		nextState: state.appendChar(char).setEscaping(false)
	};
};
