'use strict';
const hasOwnProperty = require('has-own-property');

const operators = {
	/*
	'&': 'AND',*/
	'|': 'PIPE',
	'(': 'OPEN_PAREN',
	')': 'CLOSE_PAREN',
	'>': 'GREAT',
	'<': 'LESS',
	'&&': 'AND_IF',
	'||': 'OR_IF',
	';;': 'DSEMI',
	'<<': 'DLESS',
	'>>': 'DGREAT',
	'<&': 'LESSAND',
	'>&': 'GREATAND',
	'<>': 'LESSGREAT',
	'<<-': 'DLESSDASH',
	'>|': 'CLOBBER'
};

function advanceLoc(data, char) {
	data.loc.previous = Object.assign({}, data.loc.current);
	if (char === '\n') {
		data.loc.current.row++;
		data.loc.current.col = 1;
	} else {
		data.loc.current.col++;
	}

	data.loc.current.char++;

	if (char && char.match(/\s/) && data.current === '') {
		data.loc.start = Object.assign({}, data.loc.current);
	}
}

function * tokenizer(src) {
	let state = {
		current: '',
		escaping: false,
		loc: {
			start: {col: 1, row: 1, char: 0},
			previous: null,
			current: {col: 1, row: 1, char: 0}
		}
	};
	Object.freeze(state);
	let reduction = start;

	while (typeof reduction === 'function') {
		const char = src[state.loc.current.char];

		const {nextReduction, tokensToEmit, nextState} = reduction(state, char);

		if (tokensToEmit) {
			yield * tokensToEmit;
		}

		if (nextState) {
			state = nextState;
			Object.freeze(state);
		}

		reduction = nextReduction;

		advanceLoc(state, char);
	}
}

function start(state, char) {
	if (char === undefined) {
		return {
			nextReduction: end,
			tokensToEmit: tokenOrEmpty(state),
			nextState: Object.assign({}, state, {
				current: '',
				expansion: []
			})
		};
	}

	if (state.current === '\n' || (!state.escaping && char === '\n')) {
		const tokens = tokenOrEmpty(state).concat({
			type: 'NEWLINE',
			value: '\n'
		});
		return {
			nextReduction: start,
			tokensToEmit: tokens,
			nextState: Object.assign({}, state, {
				current: '',
				expansion: []
			})
		};
	}

	if (!state.escaping && char === '\\') {
		return {
			nextReduction: start,
			nextState: Object.assign({}, state, {
				current: state.current + char,
				escaping: true
			})
		};
	}

	if (!state.escaping && isPartOfOperator(char)) {
		const tokens = tokenOrEmpty(state);
		return {
			nextReduction: operator,
			tokensToEmit: tokens,
			nextState: Object.assign({}, state, {
				current: char,
				expansion: []
			})
		};
	}

	if (!state.escaping && char === '\'') {
		return {
			nextReduction: singleQuoting,
			nextState: Object.assign({}, state, {
				current: state.current + '\''
			})
		};
	}

	if (!state.escaping && char === '"') {
		return {
			nextReduction: doubleQuoting,
			nextState: Object.assign({}, state, {
				current: state.current + '"'
			})
		};
	}

	if (!state.escaping && char.match(/\s/)) {
		return {
			nextReduction: start,
			tokensToEmit: tokenOrEmpty(state),
			nextState: Object.assign({}, state, {current: ''})
		};
	}

	if (!state.escaping && char === '$') {
		return {
			nextReduction: expansionStart,
			nextState: Object.assign({}, state, {
				current: state.current + '$',
				expansion: (state.expansion || []).concat({
					loc: {start: Object.assign({}, state.loc.current)}
				})
			})
		};
	}

	if (!state.escaping && char === '`') {
		return {
			nextReduction: expansionCommandTick,
			nextState: Object.assign({}, state, {
				current: state.current + '`',
				expansion: (state.expansion || []).concat({
					loc: {start: Object.assign({}, state.loc.current)}
				})
			})
		};
	}

	return {
		nextReduction: start,
		nextState: Object.assign({}, state, {
			escaping: false,
			current: state.current + char

		})
	};
}

function expansionStart(state, char) {
	if (char === '{') {
		return {
			nextReduction: expansionParameterExtended,
			nextState: Object.assign({}, state, {
				current: state.current + char
			})
		};
	}

	if (char === '(') {
		return {
			nextReduction: expansionCommandOrArithmetic,
			nextState: Object.assign({}, state, {
				current: state.current + char
			})
		};
	}

	if (char.match(/[a-zA-Z_]/)) {
		const xp = state.expansion[state.expansion.length - 1];
		xp.value = char;
		xp.type = 'PARAMETER';

		return {
			nextReduction: expansionParameter,
			nextState: Object.assign({}, state, {
				current: state.current + char
			})
		};
	}

	if (isSpecialParameter(char)) {
		return expansionSpecialParameter(state, char);
	}

	if (state.doubleQuoting) {
		return doubleQuoting(state, char);
	}

	return start(state, char);
}

function expansionSpecialParameter(state, char) {
	const xp = state.expansion[state.expansion.length - 1];
	xp.value = char;
	xp.type = 'SPECIAL-PARAMETER';
	xp.loc.end = Object.assign({}, state.loc.current);

	if (state.doubleQuoting) {
		return {
			nextReduction: doubleQuoting,
			nextState: Object.assign({}, state, {
				current: state.current + char
			})
		};
	}

	return {
		nextReduction: start,
		nextState: Object.assign({}, state, {
			current: state.current + char
		})
	};
}

function expansionParameterExtended(state, char) {
	const xp = state.expansion[state.expansion.length - 1];

	if (char === '}') {
		xp.type = 'PARAMETER';
		xp.loc.end = Object.assign({}, state.loc.current);
		if (state.doubleQuoting) {
			return {
				nextReduction: doubleQuoting,
				nextState: Object.assign({}, state, {
					current: state.current + char
				})
			};
		}

		return {
			nextReduction: start,
			nextState: Object.assign({}, state, {
				current: state.current + char
			})
		};
	}

	xp.value = (xp.value || '') + char;
	return {
		nextReduction: expansionParameterExtended,
		nextState: Object.assign({}, state, {
			current: state.current + char
		})
	};
}

function expansionParameter(state, char) {
	if (char.match(/[0-9a-zA-Z_]/)) {
		state.expansion[state.expansion.length - 1].value += char;
		return {
			nextReduction: expansionParameter,
			nextState: Object.assign({}, state, {
				current: state.current + char
			})
		};
	}

	state.expansion[state.expansion.length - 1].loc.end = Object.assign({}, state.loc.previous);
	if (state.doubleQuoting) {
		return doubleQuoting(state, char);
	}
	return start(state, char);
}

function expansionCommandOrArithmetic(state, char) {
	const xp = state.expansion[state.expansion.length - 1];
	if (char === '(' && state.current.slice(-2) === '$(') {
		return {
			nextReduction: expansionArithmetic,
			nextState: Object.assign({}, state, {
				current: state.current + char
			})
		};
	}

	if (char === ')') {
		xp.type = 'COMMAND';
		xp.loc.end = Object.assign({}, state.loc.current);
		if (state.doubleQuoting) {
			return {
				nextReduction: doubleQuoting,
				nextState: Object.assign({}, state, {
					current: state.current + char
				})
			};
		}
		return {
			nextReduction: start,
			nextState: Object.assign({}, state, {
				current: state.current + char
			})
		};
	}

	xp.value = (xp.value || '') + char;
	return {
		nextReduction: expansionCommandOrArithmetic,
		nextState: Object.assign({}, state, {
			current: state.current + char
		})
	};
}

function expansionCommandTick(state, char) {
	const xp = state.expansion[state.expansion.length - 1];
	if (!state.escaping && char === '`') {
		xp.type = 'COMMAND';
		xp.loc.end = Object.assign({}, state.loc.current);
		if (state.doubleQuoting) {
			return {
				nextReduction: doubleQuoting,
				nextState: Object.assign({}, state, {
					current: state.current + char
				})
			};
		}
		return {
			nextReduction: start,
			nextState: Object.assign({}, state, {
				current: state.current + char
			})
		};
	}

	xp.value = (xp.value || '') + char;
	return {
		nextReduction: expansionCommandTick,
		nextState: Object.assign({}, state, {
			current: state.current + char
		})
	};
}

function expansionArithmetic(state, char) {
	const xp = state.expansion[state.expansion.length - 1];

	if (char === ')' && state.current.slice(-1)[0] === ')') {
		xp.type = 'ARITHMETIC';
		xp.value = xp.value.slice(0, -1);
		xp.loc.end = Object.assign({}, state.loc.current);
		if (state.doubleQuoting) {
			return {
				nextReduction: doubleQuoting,
				nextState: Object.assign({}, state, {
					current: state.current + char
				})
			};
		}
		return {
			nextReduction: start,
			nextState: Object.assign({}, state, {
				current: state.current + char
			})
		};
	}

	xp.value = (xp.value || '') + char;
	return {
		nextReduction: expansionArithmetic,
		nextState: Object.assign({}, state, {
			current: state.current + char
		})
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
			nextState: Object.assign({}, state, {
				current: '',
				expansion: []
			})
		};
	}

	if (char === '\'') {
		return {
			nextReduction: start,
			nextState: Object.assign({}, state, {
				current: state.current + char
			})
		};
	}

	return {
		nextReduction: singleQuoting,
		nextState: Object.assign({}, state, {
			current: state.current + char
		})
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
			nextState: Object.assign({}, state, {
				doubleQuoting: false,
				current: '',
				expansion: []
			})
		};
	}

	if (!state.escaping && char === '\\') {
		return {
			nextReduction: doubleQuoting,
			nextState: Object.assign({}, state, {
				doubleQuoting: true,
				escaping: true,
				current: state.current + char
			})

		};
	}

	if (!state.escaping && char === '"') {
		return {
			nextReduction: start,
			nextState: Object.assign({}, state, {
				doubleQuoting: false,
				current: state.current + char
			})
		};
	}

	if (!state.escaping && char === '$') {
		return {
			nextReduction: expansionStart,
			nextState: Object.assign({}, state, {
				doubleQuoting: true,
				current: state.current + char,
				expansion: (state.expansion || []).concat({
					loc: {start: Object.assign({}, state.loc.current)}
				})
			})
		};
	}

	if (!state.escaping && char === '`') {
		return {
			nextReduction: expansionCommandTick,
			nextState: Object.assign({}, state, {
				doubleQuoting: true,
				current: state.current + char,
				expansion: (state.expansion || []).concat({
					loc: {start: Object.assign({}, state.loc.current)}
				})
			})
		};
	}

	return {
		nextReduction: doubleQuoting,
		nextState: Object.assign({}, state, {
			doubleQuoting: true,
			escaping: false,
			current: state.current + char
		})
	};
}

function operator(state, char) {
	if (char === undefined) {
		if (isOperator(state.current)) {
			return {
				nextReduction: end,
				tokensToEmit: operatorTokens(state),
				nextState: Object.assign({}, state, {current: ''})
			};
		}
		return start(state, char);
	}

	if (isPartOfOperator(state.current + char)) {
		return {
			nextReduction: operator,
			nextState: Object.assign({}, state, {
				current: state.current + char
			})
		};
	}

	let tokens = [];
	if (isOperator(state.current)) {
		tokens = operatorTokens(state);
		state = Object.assign({}, state, {current: ''});
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
				start: Object.assign({}, state.loc.start),
				end: Object.assign({}, state.loc.previous)
			}
		};

		if (state.expansion && state.expansion.length) {
			token.expansion = state.expansion;
		}

		state.loc.start = Object.assign({}, state.loc.current);
		return [token];
	}
	return [];
}

function operatorTokens(state) {
	const token = {
		type: operators[state.current],
		value: state.current,
		loc: {
			start: Object.assign({}, state.loc.start),
			end: Object.assign({}, state.loc.previous)
		}
	};

	state.loc.start = Object.assign({}, state.loc.current);
	return [token];
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
