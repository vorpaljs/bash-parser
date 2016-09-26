'use strict';
import hasOwnProperty from 'has-own-property';
import deepFreeze from 'deep-freeze';
import last from 'array-last';
import operators from '../enums/operators';

function * tokenizer(src) {
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

function start(state, char) {
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
			nextState: {...state, current: state.current + '\''}
		};
	}

	if (!state.escaping && char === '"') {
		return {
			nextReduction: doubleQuoting,
			nextState: {...state, current: state.current + '"'}
		};
	}

	if (!state.escaping && char.match(/\s/)) {
		return {
			nextReduction: start,
			tokensToEmit: tokenOrEmpty(state),
			nextState: {...state, current: '', loc: {...state.loc, start: state.loc.current}}
		};
	}

	if (!state.escaping && char === '$') {
		return {
			nextReduction: expansionStart,
			nextState: {
				...state,
				current: state.current + '$',
				expansion: appendEmptyExpansion(state)
			}
		};
	}

	if (!state.escaping && char === '`') {
		return {
			nextReduction: expansionCommandTick,
			nextState: {
				...state,
				current: state.current + '`',
				expansion: appendEmptyExpansion(state)
			}
		};
	}

	return {
		nextReduction: start,
		nextState: {...state, escaping: false, current: state.current + char}
	};
}

function expansionStart(state, char) {
	if (char === '{') {
		return {
			nextReduction: expansionParameterExtended,
			nextState: {...state, current: state.current + char}
		};
	}

	if (char === '(') {
		return {
			nextReduction: expansionCommandOrArithmetic,
			nextState: {...state, current: state.current + char}
		};
	}

	if (char.match(/[a-zA-Z_]/)) {
		const newXp = {...last(state.expansion), value: char, type: 'PARAMETER'};
		const expansion = state.expansion
			.slice(0, -1)
			.concat(newXp);

		return {
			nextReduction: expansionParameter,
			nextState: {...state, current: state.current + char, expansion}
		};
	}

	if (isSpecialParameter(char)) {
		return expansionSpecialParameter(state, char);
	}

	return state.previousReducer(state, char);
}

function expansionSpecialParameter(state, char) {
	const xp = last(state.expansion);

	const newXp = {
		...xp,
		value: char,
		type: 'SPECIAL-PARAMETER',
		loc: {...xp.loc, end: state.loc.current}
	};

	const expansion = state.expansion
		.slice(0, -1)
		.concat(newXp);

	return {
		nextReduction: state.previousReducer,
		nextState: {...state, current: state.current + char, expansion}
	};
}

function expansionParameterExtended(state, char) {
	const xp = last(state.expansion);

	if (char === '}') {
		const newXp = {
			...xp,
			type: 'PARAMETER',
			loc: {...xp.loc, end: state.loc.current}
		};

		const expansion = state.expansion
			.slice(0, -1)
			.concat(newXp);

		return {
			nextReduction: state.previousReducer,
			nextState: {...state, current: state.current + char, expansion}
		};
	}

	const newXp = {
		...xp,
		value: (xp.value || '') + char
	};

	const expansion = state.expansion
			.slice(0, -1)
			.concat(newXp);

	return {
		nextReduction: expansionParameterExtended,
		nextState: {...state, current: state.current + char, expansion}
	};
}

function expansionParameter(state, char) {
	const xp = last(state.expansion);
	if (char.match(/[0-9a-zA-Z_]/)) {
		const newXp = {...xp, value: xp.value + char};
		const expansion = state.expansion
			.slice(0, -1)
			.concat(newXp);

		return {
			nextReduction: expansionParameter,
			nextState: {...state, current: state.current + char, expansion}
		};
	}
	const newXp = {...xp, loc: {...xp.loc, end: state.loc.previous}};
	const expansion = state.expansion
		.slice(0, -1)
		.concat(newXp);

	return state.previousReducer({...state, expansion}, char);
}

function expansionCommandOrArithmetic(state, char) {
	const xp = last(state.expansion);
	if (char === '(' && state.current.slice(-2) === '$(') {
		return {
			nextReduction: expansionArithmetic,
			nextState: {...state, current: state.current + char}
		};
	}

	if (char === ')') {
		const newXp = {
			...xp,
			type: 'COMMAND',
			loc: {...xp.loc, end: state.loc.current}
		};
		const expansion = state.expansion
			.slice(0, -1)
			.concat(newXp);

		return {
			nextReduction: state.previousReducer,
			nextState: {...state, current: state.current + char, expansion}
		};
	}

	const newXp = {
		...xp,
		value: (xp.value || '') + char
	};

	const expansion = state.expansion
			.slice(0, -1)
			.concat(newXp);

	return {
		nextReduction: expansionCommandOrArithmetic,
		nextState: {...state, current: state.current + char, expansion}
	};
}

function expansionCommandTick(state, char) {
	const xp = last(state.expansion);
	if (!state.escaping && char === '`') {
		const newXp = {
			...xp,
			type: 'COMMAND',
			loc: {...xp.loc, end: state.loc.current}
		};
		const expansion = state.expansion
			.slice(0, -1)
			.concat(newXp);

		return {
			nextReduction: state.previousReducer,
			nextState: {...state, current: state.current + char, expansion}
		};
	}

	const newXp = {
		...xp,
		value: (xp.value || '') + char
	};

	const expansion = state.expansion
			.slice(0, -1)
			.concat(newXp);

	return {
		nextReduction: expansionCommandTick,
		nextState: {...state, current: state.current + char, expansion}
	};
}

function expansionArithmetic(state, char) {
	const xp = last(state.expansion);

	if (char === ')' && state.current.slice(-1)[0] === ')') {
		const newXp = {
			...xp,
			type: 'ARITHMETIC',
			value: xp.value.slice(0, -1),
			loc: {...xp.loc, end: state.loc.current}
		};

		const expansion = state.expansion
			.slice(0, -1)
			.concat(newXp);

		return {
			nextReduction: state.previousReducer,
			nextState: {...state, current: state.current + char, expansion}
		};
	}

	const newXp = {
		...xp,
		value: (xp.value || '') + char
	};

	const expansion = state.expansion
			.slice(0, -1)
			.concat(newXp);

	return {
		nextReduction: expansionArithmetic,
		nextState: {...state, current: state.current + char, expansion}
	};
}

function singleQuoting(state, char) {
	if (char === undefined) {
		return {
			nextReduction: null,
			tokensToEmit: tokenOrEmpty(state).concat({
				type: 'CONTINUE',
				value: ''
			}),
			nextState: {...state, current: '', expansion: [], loc: {...state.loc, start: state.loc.current}}
		};
	}

	if (char === '\'') {
		return {
			nextReduction: start,
			nextState: {...state, current: state.current + char}
		};
	}

	return {
		nextReduction: singleQuoting,
		nextState: {...state, current: state.current + char}
	};
}

function doubleQuoting(state, char) {
	if (char === undefined) {
		return {
			nextReduction: null,
			tokensToEmit: tokenOrEmpty(state).concat({
				type: 'CONTINUE',
				value: ''
			}),
			nextState: {
				...state,
				previousReducer: start,
				current: '',
				expansion: [],
				loc: {...state.loc, start: state.loc.current}
			}
		};
	}

	if (!state.escaping && char === '\\') {
		return {
			nextReduction: doubleQuoting,
			nextState: {
				...state,
				previousReducer: doubleQuoting,
				escaping: true,
				current: state.current + char
			}

		};
	}

	if (!state.escaping && char === '"') {
		return {
			nextReduction: start,
			nextState: {
				...state,
				previousReducer: start,
				current: state.current + char
			}
		};
	}

	if (!state.escaping && char === '$') {
		const expansion = appendEmptyExpansion(state);

		return {
			nextReduction: expansionStart,
			nextState: {
				...state,
				previousReducer: doubleQuoting,
				current: state.current + char,
				expansion
			}
		};
	}

	if (!state.escaping && char === '`') {
		const expansion = appendEmptyExpansion(state);

		return {
			nextReduction: expansionCommandTick,
			nextState: {
				...state,
				previousReducer: doubleQuoting,
				current: state.current + char,
				expansion
			}
		};
	}

	return {
		nextReduction: doubleQuoting,
		nextState: {
			...state,
			previousReducer: doubleQuoting,
			escaping: false,
			current: state.current + char
		}
	};
}

function operator(state, char) {
	if (char === undefined) {
		if (isOperator(state.current)) {
			return {
				nextReduction: end,
				tokensToEmit: operatorTokens(state),
				nextState: {...state, current: '', loc: {...state.loc, start: state.loc.current}}
			};
		}
		return start(state, char);
	}

	if (isPartOfOperator(state.current + char)) {
		return {
			nextReduction: operator,
			nextState: {...state, current: state.current + char}
		};
	}

	let tokens = [];
	if (isOperator(state.current)) {
		tokens = operatorTokens(state);
		state = {...state, current: '', loc: {...state.loc, start: state.loc.current}};
	}

	const {nextReduction, tokensToEmit, nextState} = start(state, char);
	if (tokensToEmit) {
		tokens = tokens.concat(tokensToEmit);
	}
	return {
		nextReduction: nextReduction,
		tokensToEmit: tokens,
		nextState
	};
}

function end() {
	return {
		nextReduction: null,
		tokensToEmit: [{
			type: 'EOF',
			value: ''
		}]
	};
}

module.exports = tokenizer;

function tokenOrEmpty(state) {
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

function operatorTokens(state) {
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

function newLine() {
	return {
		type: 'NEWLINE',
		value: '\n'
	};
}

function isPartOfOperator(text) {
	return Object.keys(operators).some(op => op.slice(0, text.length) === text);
}

function isOperator(text) {
	return hasOwnProperty(operators, text);
}

function isSpecialParameter(char) {
	return char.match(/^[0-9\-!@#\?\*\$]$/);
}

function appendEmptyExpansion(state) {
	return (state.expansion || []).concat({
		loc: {start: {...state.loc.current}}
	});
}

function advanceLoc(state, char) {
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
