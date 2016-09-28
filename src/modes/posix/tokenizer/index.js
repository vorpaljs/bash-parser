'use strict';
import deepFreeze from 'deep-freeze';

import {eof, continueToken, tokenOrEmpty, operatorTokens, newLine, isPartOfOperator,
	isOperator, isSpecialParameter, appendEmptyExpansion, advanceLoc} from '../../../utils/tokens';

import start from './reducers/start';

export {eof, continueToken, tokenOrEmpty, operatorTokens, newLine, isPartOfOperator,
	isOperator, isSpecialParameter, appendEmptyExpansion, advanceLoc};

export default () => function * tokenizer(src) {
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

	// deepFreeze(state);
	let reduction = start;

	while (typeof reduction === 'function') {
		const char = src[state.loc.current.char];
		// console.log({char, reduction})
		const {nextReduction, tokensToEmit, nextState} = reduction(state, char);
		if (tokensToEmit) {
			yield * tokensToEmit;
		}

		if (char === undefined && nextReduction === reduction) {
			throw new Error('Loop detected');
		}

		if (nextState) {
			state = advanceLoc(nextState, char);
		} else {
			state = advanceLoc(state, char);
		}

		// deepFreeze(state);
		reduction = nextReduction;
	}
};
