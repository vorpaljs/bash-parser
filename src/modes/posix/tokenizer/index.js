'use strict';
import hasOwnProperty from 'has-own-property';
import deepFreeze from 'deep-freeze';
import operators from '../enums/operators';

import start from './reducers/start';

export default function * tokenizer(src) {
	let state = {
		current: '',
		escaping: false,
		previousReducer: start,
		loc: {
			start: {col: 1, row: 1, char: 0},
			previous: null,
			current: {col: 1, row: 1, char: 0}
		}
	};

	deepFreeze(state);
	let reduction = start;

	while (typeof reduction === 'function') {
		const char = src[state.loc.current.char];

		const {nextReduction, tokensToEmit, nextState} = reduction(state, char);

		if (tokensToEmit) {
			yield * tokensToEmit;
		}

		if (nextState) {
			state = advanceLoc(nextState, char);
		} else {
			state = advanceLoc(state, char);
		}

		deepFreeze(state);
		reduction = nextReduction;
	}
}

export function tokenOrEmpty(state) {
	if (state.current !== '' && state.current !== '\n') {
		const token = {
			type: 'TOKEN',
			value: state.current,
			loc: {
				start: {...state.loc.start},
				end: {...state.loc.previous}
			}
		};

		if (state.expansion && state.expansion.length) {
			token.expansion = state.expansion;
		}

		return [token];
	}
	return [];
}

export function operatorTokens(state) {
	const token = {
		type: operators[state.current],
		value: state.current,
		loc: {
			start: {...state.loc.start},
			end: {...state.loc.previous}
		}
	};

	return [token];
}

export function newLine() {
	return {
		type: 'NEWLINE',
		value: '\n'
	};
}

export function isPartOfOperator(text) {
	return Object.keys(operators).some(op => op.slice(0, text.length) === text);
}

export function isOperator(text) {
	return hasOwnProperty(operators, text);
}

export function isSpecialParameter(char) {
	return char.match(/^[0-9\-!@#\?\*\$]$/);
}

export function appendEmptyExpansion(state) {
	return (state.expansion || []).concat({
		loc: {start: {...state.loc.current}}
	});
}

export function advanceLoc(state, char) {
	const loc = {
		...state.loc,
		current: {...state.loc.current},
		previous: {...state.loc.current}

	};

	if (char === '\n') {
		loc.current.row++;
		loc.current.col = 1;
	} else {
		loc.current.col++;
	}

	loc.current.char++;

	if (char && char.match(/\s/) && state.current === '') {
		loc.start = {...loc.current};
	}

	return {...state, loc};
}
