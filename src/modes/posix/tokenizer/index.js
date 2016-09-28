'use strict';
import deepFreeze from 'deep-freeze';

import {eof, continueToken, tokenOrEmpty, operatorTokens, newLine, isPartOfOperator,
	isOperator, isSpecialParameter} from '../../../utils/tokens';

import start from './reducers/start';

export {eof, continueToken, tokenOrEmpty, operatorTokens, newLine, isPartOfOperator,
	isOperator, isSpecialParameter};

const defaultFields = {
	current: '',
	escaping: false,
	previousReducer: start,
	loc: {
		start: {col: 1, row: 1, char: 0},
		previous: null,
		current: {col: 1, row: 1, char: 0}
	}
};

class State {
	constructor(fields = defaultFields) {
		Object.assign(this, fields);
		deepFreeze(this);
	}

	setLoc(loc) {
		return new State({...this, loc});
	}

	setEscaping(escaping) {
		return new State({...this, escaping});
	}

	setExpansion(expansion) {
		return new State({...this, expansion});
	}

	setPreviousReducer(previousReducer) {
		return new State({...this, previousReducer});
	}

	setCurrent(current) {
		return new State({...this, current});
	}

	appendEmptyExpansion() {
		const expansion = (this.expansion || []).concat({
			loc: {start: {...this.loc.current}}
		});
		return this.setExpansion(expansion);
	}

	appendChar(char) {
		return new State({...this, current: this.current + char});
	}

	removeLastChar() {
		return new State({...this, current: this.current.slice(0, -1)});
	}

	saveCurrentLocAsStart() {
		return new State({...this, loc: {...this.loc, start: this.loc.current}});
	}

	resetCurrent() {
		return new State({...this, current: ''});
	}

	advanceLoc(char) {
		const loc = {
			...this.loc,
			current: {...this.loc.current},
			previous: {...this.loc.current}
		};

		if (char === '\n') {
			loc.current.row++;
			loc.current.col = 1;
		} else {
			loc.current.col++;
		}

		loc.current.char++;

		if (char && char.match(/\s/) && this.current === '') {
			loc.start = {...loc.current};
		}

		return this.setLoc(loc);
	}
}

class MutableState {
	constructor(fields = defaultFields) {
		Object.assign(this, fields);
	}

	setLoc(loc) {
		this.loc = loc;
		return this;
	}

	setEscaping(escaping) {
		this.escaping = escaping;
		return this;
	}

	setExpansion(expansion) {
		this.expansion = expansion;
		return this;
	}

	setPreviousReducer(previousReducer) {
		this.previousReducer = previousReducer;
		return this;
	}

	setCurrent(current) {
		this.current = current;
		return this;
	}

	appendEmptyExpansion() {
		this.expansion = (this.expansion || []);
		this.expansion.push({
			loc: {start: {...this.loc.current}}
		});
		return this;
	}

	appendChar(char) {
		this.current = this.current + char;
		return this;
	}

	removeLastChar() {
		this.current = this.current.slice(0, -1);
		return this;
	}

	saveCurrentLocAsStart() {
		this.loc.start = Object.assign({}, this.loc.current);
		return this;
	}

	resetCurrent() {
		this.current = '';
		return this;
	}

	advanceLoc(char) {
		const loc = JSON.parse(JSON.stringify(this.loc));
		loc.previous = Object.assign({}, this.loc.current);

		if (char === '\n') {
			loc.current.row++;
			loc.current.col = 1;
		} else {
			loc.current.col++;
		}

		loc.current.char++;

		if (char && char.match(/\s/) && this.current === '') {
			loc.start = Object.assign({}, loc.current);
		}

		return this.setLoc(loc);
	}
}

export default () => function * tokenizer(src) {
	let state = new MutableState();

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
			state = nextState.advanceLoc(char);
		} else {
			state = state.advanceLoc(char);
		}

		// deepFreeze(state);
		reduction = nextReduction;
	}
};
