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
	let data = {
		results: [],
		current: '',
		escaping: false,
		loc: {
			start: {col: 1, row: 1, char: 0},
			previous: null,
			current: {col: 1, row: 1, char: 0}
		}
	};
	let reduction = start;

	while (typeof reduction === 'function') {
		const char = src[data.loc.current.char];
		let tokens = null;
		let nextReduction = null;
		try {
			[nextReduction, tokens] = reduction(data, char);

			if (tokens) {
				yield * tokens;
			}
		} catch (err) {
			throw new Error(err.message + `: ${JSON.stringify({tokens, reduction, nextReduction})}`);
		}

		reduction = nextReduction;
		advanceLoc(data, char);
	}
}

function start(data, char) {
	if (char === undefined) {
		return [end, tokenOrEmpty(data)];
	}

	if (data.current === '\n' || (!data.escaping && char === '\n')) {
		const tokens = tokenOrEmpty(data).concat({
			type: 'NEWLINE',
			value: '\n'
		});
		data.current = '';
		return [start, tokens];
	}

	if (!data.escaping && char === '\\') {
		data.escaping = true;
		data.current += char;
		return [start];
	}

	if (!data.escaping && isPartOfOperator(char)) {
		const tokens = tokenOrEmpty(data);
		data.current = char;
		return [operator, tokens];
	}

	if (!data.escaping && char === '\'') {
		data.current += '\'';
		return [singleQuoting];
	}

	if (!data.escaping && char === '"') {
		data.current += '"';
		return [doubleQuoting];
	}

	if (!data.escaping && char.match(/\s/)) {
		return [start, tokenOrEmpty(data)];
	}

	if (!data.escaping && char === '$') {
		data.current += '$';
		data.expansion = (data.expansion || []).concat({
			loc: {start: Object.assign({}, data.loc.current)}
		});
		return [expansionStart];
	}

	if (!data.escaping && char === '`') {
		data.current += '`';
		data.expansion = (data.expansion || []).concat({
			loc: {start: Object.assign({}, data.loc.current)}
		});
		return [expansionCommandTick];
	}

	if (data.escaping) {
		data.escaping = false;
	}

	data.current += char;
	return [start];
}

function expansionStart(data, char) {
	if (char === '{') {
		data.current += char;
		return [expansionParameterExtended];
	}

	if (char === '(') {
		data.current += char;
		return [expansionCommandOrArithmetic];
	}

	if (char.match(/[a-zA-Z_]/)) {
		const xp = data.expansion[data.expansion.length - 1];
		xp.value = char;
		xp.type = 'PARAMETER';
		data.current += char;

		return [expansionParameter];
	}

	if (isSpecialParameter(char)) {
		return expansionSpecialParameter(data, char);
	}

	if (data.doubleQuoting) {
		return doubleQuoting(data, char);
	}

	return start(data, char);
}

function expansionSpecialParameter(data, char) {
	const xp = data.expansion[data.expansion.length - 1];
	xp.value = char;
	xp.type = 'SPECIAL-PARAMETER';
	xp.loc.end = Object.assign({}, data.loc.current);
	data.current += char;

	if (data.doubleQuoting) {
		return [doubleQuoting];
	}
	return [start];
}

function expansionParameterExtended(data, char) {
	const xp = data.expansion[data.expansion.length - 1];

	if (char === '}') {
		xp.type = 'PARAMETER';
		xp.loc.end = Object.assign({}, data.loc.current);
		data.current += char;
		if (data.doubleQuoting) {
			return [doubleQuoting];
		}

		return [start];
	}

	data.current += char;
	xp.value = (xp.value || '') + char;
	return [expansionParameterExtended];
}

function expansionParameter(data, char) {
	if (char.match(/[0-9a-zA-Z_]/)) {
		data.current += char;
		data.expansion[data.expansion.length - 1].value += char;
		return [expansionParameter];
	}

	data.expansion[data.expansion.length - 1].loc.end = Object.assign({}, data.loc.previous);
	if (data.doubleQuoting) {
		return doubleQuoting(data, char);
	}
	return start(data, char);
}

function expansionCommandOrArithmetic(data, char) {
	const xp = data.expansion[data.expansion.length - 1];
	if (char === '(' && data.current.slice(-2) === '$(') {
		data.current += char;
		return [expansionArithmetic];
	}

	if (char === ')') {
		data.current += char;
		xp.type = 'COMMAND';
		xp.loc.end = Object.assign({}, data.loc.current);
		if (data.doubleQuoting) {
			return [doubleQuoting];
		}
		return [start];
	}

	data.current += char;
	xp.value = (xp.value || '') + char;
	return [expansionCommandOrArithmetic];
}

function expansionCommandTick(data, char) {
	const xp = data.expansion[data.expansion.length - 1];
	if (!data.escaping && char === '`') {
		data.current += char;
		xp.type = 'COMMAND';
		xp.loc.end = Object.assign({}, data.loc.current);
		if (data.doubleQuoting) {
			return [doubleQuoting];
		}
		return [start];
	}

	data.current += char;
	xp.value = (xp.value || '') + char;
	return [expansionCommandTick];
}

function expansionArithmetic(data, char) {
	const xp = data.expansion[data.expansion.length - 1];

	if (char === ')' && data.current.slice(-1)[0] === ')') {
		data.current += char;
		xp.type = 'ARITHMETIC';
		xp.value = xp.value.slice(0, -1);
		xp.loc.end = Object.assign({}, data.loc.current);
		if (data.doubleQuoting) {
			return [doubleQuoting];
		}
		return [start];
	}

	data.current += char;
	xp.value = (xp.value || '') + char;
	return [expansionArithmetic];
}

function singleQuoting(data, char) {
	if (char === undefined) {
		return [null, tokenOrEmpty(data).concat({
			type: 'CONTINUE',
			value: ''
		})];
	}

	if (char === '\'') {
		data.current += char;
		return [start];
	}

	data.current += char;
	return [singleQuoting];
}

function doubleQuoting(data, char) {
	data.doubleQuoting = true;
	if (char === undefined) {
		data.doubleQuoting = false;
		return [null, tokenOrEmpty(data).concat({
			type: 'CONTINUE',
			value: ''
		})];
	}

	if (!data.escaping && char === '\\') {
		data.escaping = true;
		data.current += char;
		return [doubleQuoting];
	}

	if (!data.escaping && char === '"') {
		data.current += char;
		data.doubleQuoting = false;
		return [start];
	}

	if (!data.escaping && char === '$') {
		data.current += '$';
		data.expansion = (data.expansion || []).concat({
			loc: {start: Object.assign({}, data.loc.current)}
		});
		return [expansionStart];
	}

	if (!data.escaping && char === '`') {
		data.current += '`';
		data.expansion = (data.expansion || []).concat({
			loc: {start: Object.assign({}, data.loc.current)}
		});
		return [expansionCommandTick];
	}

	if (data.escaping) {
		data.escaping = false;
	}

	data.current += char;
	return [doubleQuoting];
}

function operator(data, char) {
	if (char === undefined) {
		if (isOperator(data.current)) {
			return [end, operatorTokens(data)];
		}
		return start(data, char);
	}

	if (isPartOfOperator(data.current + char)) {
		data.current += char;
		return [operator];
	}

	let tokens = [];
	if (isOperator(data.current)) {
		tokens = operatorTokens(data);
	}

	const [nextReduction, opTokens] = start(data, char);
	if (opTokens) {
		tokens = tokens.concat(opTokens);
	}
	return [nextReduction, tokens];
}

function end() {
	return [null, [{
		type: 'EOF',
		value: ''
	}]];
}

module.exports = tokenizer;

function tokenOrEmpty(data) {
	if (data.current !== '' && data.current !== '\n') {
		const token = {
			type: 'TOKEN',
			value: data.current,
			loc: {
				start: Object.assign({}, data.loc.start),
				end: Object.assign({}, data.loc.previous)
			}
		};

		if (data.expansion) {
			token.expansion = data.expansion;
			delete data.expansion;
		}

		data.loc.start = Object.assign({}, data.loc.current);
		data.current = '';
		return [token];
	}
	return [];
}

function operatorTokens(data) {
	const token = {
		type: operators[data.current],
		value: data.current,
		loc: {
			start: Object.assign({}, data.loc.start),
			end: Object.assign({}, data.loc.previous)
		}
	};

	data.loc.start = Object.assign({}, data.loc.current);
	data.current = '';
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
