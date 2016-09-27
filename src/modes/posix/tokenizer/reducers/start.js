'use strict';

import end from './end';
import operator from './operator';
import singleQuoting from './singleQuoting';
import doubleQuoting from './doubleQuoting';
import expansionStart from './expansionStart';
import expansionCommandTick from './expansionCommandTick';

import {tokenOrEmpty, newLine, isPartOfOperator, appendEmptyExpansion} from '..';

export default function start(state, char) {
	if (char === undefined) {
		return {
			nextReduction: end,
			tokensToEmit: tokenOrEmpty(state),
			nextState: {...state, current: '', expansion: [], loc: {...state.loc, start: state.loc.current}}
		};
	}

	if (state.current === '\n' || (!state.escaping && char === '\n')) {
		return {
			nextReduction: start,
			tokensToEmit: tokenOrEmpty(state).concat(newLine()),
			nextState: {...state, current: '', expansion: [], loc: {...state.loc, start: state.loc.current}}
		};
	}

	if (!state.escaping && char === '\\') {
		return {
			nextReduction: start,
			nextState: {...state, current: state.current + char, escaping: true}
		};
	}

	if (!state.escaping && isPartOfOperator(char)) {
		return {
			nextReduction: operator,
			tokensToEmit: tokenOrEmpty(state),
			nextState: {...state, current: char, expansion: [], loc: {...state.loc, start: state.loc.current}}
		};
	}

	if (!state.escaping && char === '\'') {
		return {
			nextReduction: singleQuoting,
			nextState: {...state, current: state.current + char}
		};
	}

	if (!state.escaping && char === '"') {
		return {
			nextReduction: doubleQuoting,
			nextState: {...state, current: state.current + char}
		};
	}

	if (!state.escaping && char.match(/\s/)) {
		return {
			nextReduction: start,
			tokensToEmit: tokenOrEmpty(state),
			nextState: {...state, current: '', expansion: [], loc: {...state.loc, start: state.loc.current}}
		};
	}

	if (!state.escaping && char === '$') {
		return {
			nextReduction: expansionStart,
			nextState: {
				...state,
				current: state.current + char,
				expansion: appendEmptyExpansion(state)
			}
		};
	}

	if (!state.escaping && char === '`') {
		return {
			nextReduction: expansionCommandTick,
			nextState: {
				...state,
				current: state.current + char,
				expansion: appendEmptyExpansion(state)
			}
		};
	}

	return {
		nextReduction: start,
		nextState: {...state, escaping: false, current: state.current + char}
	};
}
