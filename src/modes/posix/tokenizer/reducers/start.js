'use strict';

const t = require('../../../../utils/tokens');

const tokenOrEmpty = t.tokenOrEmpty;
const newLine = t.newLine;
const isPartOfOperator = t.isPartOfOperator;

module.exports = function start(state, source, reducers) {
	const char = source && source.shift();

	if (char === undefined) {
		return {
			nextReduction: reducers.end,
			tokensToEmit: tokenOrEmpty(state),
			nextState: state.resetCurrent().saveCurrentLocAsStart()
		};
	}

	if (state.escaping && char === '\n') {
		return {
			nextReduction: reducers.start,
			nextState: state.setEscaping(false).removeLastChar()
		};
	}

	if (!state.escaping && char === '#' && state.current === '') {
		return {
			nextReduction: reducers.comment
		};
	}

	if (!state.escaping && char === '\n') {
		return {
			nextReduction: reducers.start,
			tokensToEmit: tokenOrEmpty(state).concat(newLine()),
			nextState: state.resetCurrent().saveCurrentLocAsStart()
		};
	}

	if (!state.escaping && char === '\\') {
		return {
			nextReduction: reducers.start,
			nextState: state.setEscaping(true).appendChar(char)
		};
	}

	if (!state.escaping && isPartOfOperator(char)) {
		return {
			nextReduction: reducers.operator,
			tokensToEmit: tokenOrEmpty(state),
			nextState: state.setCurrent(char).saveCurrentLocAsStart()
		};
	}

	if (!state.escaping && char === '\'') {
		return {
			nextReduction: reducers.singleQuoting,
			nextState: state.appendChar(char)
		};
	}

	if (!state.escaping && char === '"') {
		return {
			nextReduction: reducers.doubleQuoting,
			nextState: state.appendChar(char)
		};
	}

	if (!state.escaping && char.match(/\s/)) {
		return {
			nextReduction: reducers.start,
			tokensToEmit: tokenOrEmpty(state),
			nextState: state.resetCurrent().saveCurrentLocAsStart().setExpansion([])
		};
	}

	if (!state.escaping && char === '$') {
		return {
			nextReduction: reducers.expansionStart,
			nextState: state.appendChar(char).appendEmptyExpansion()
		};
	}

	if (!state.escaping && char === '`') {
		return {
			nextReduction: reducers.expansionCommandTick,
			nextState: state.appendChar(char).appendEmptyExpansion()
		};
	}

	return {
		nextReduction: reducers.start,
		nextState: state.appendChar(char).setEscaping(false)
	};
};
