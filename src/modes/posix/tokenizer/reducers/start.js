'use strict';

import end from './end';
import operator from './operator';
import comment from './comment';
import singleQuoting from './single-quoting';
import doubleQuoting from './double-quoting';
import expansionStart from './expansion-start';
import expansionCommandTick from './expansion-command-tick';

import {tokenOrEmpty, newLine, isPartOfOperator, appendEmptyExpansion} from '..';

export default function start(state, char) {
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
}
