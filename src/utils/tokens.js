'use strict';
const filter = require('filter-obj');
const hasOwnProperty = require('has-own-property');
const operators = require('../modes/posix/enums/operators');

class Token {
	constructor(fields) {
		const definedFields = filter(fields, (key, value) => value !== undefined);
		Object.assign(this, definedFields);

		if (this._ === undefined) {
			this._ = {};
		}
	}

	is(type) {
		return this.type === type;
	}
}

exports.Token = Token;

function mkToken(type, value, loc, expansion) {
	const tk = new Token({type, value, loc});
	if (expansion && expansion.length) {
		tk.expansion = expansion;
	}
	Object.freeze(tk);
	return tk;
}

exports.mkToken = mkToken;

exports.mkFieldSplitToken = function mkFieldSplitToken(joinedTk, value, fieldIdx) {
	const tk = new Token({
		type: joinedTk.type,
		value,
		joined: joinedTk.value,
		fieldIdx,
		loc: joinedTk.loc,
		expansion: joinedTk.expansion,
		originalText: joinedTk.originalText
	});

	Object.freeze(tk);
	return tk;
};

exports.appendTo = function appendTo(tk, chunk) {
	const newTk = new Token(Object.assign({}, tk, {value: tk.value + chunk}));
	Object.freeze(newTk);
	return newTk;
};

exports.changeTokenType = function changeTokenType(tk, type, value) {
	const newTk = new Token({type, value, loc: tk.loc, _: tk._, expansion: tk.expansion});
	Object.freeze(newTk);
	return newTk;
};

exports.setValue = function setValue(tk, value) {
	const newTk = new Token(Object.assign({}, tk, {value}));
	Object.freeze(newTk);
	return newTk;
};

exports.alterValue = function setValue(tk, value) {
	const originalText = tk.originalText || tk.value;
	const newTk = new Token(Object.assign({}, tk, {value, originalText}));
	Object.freeze(newTk);
	return newTk;
};

exports.addExpansions = function addExpansions(tk) {
	const newTk = new Token(Object.assign({}, tk, {expansion: []}));
	Object.freeze(newTk);
	return newTk;
};

exports.tokenOrEmpty = function tokenOrEmpty(state) {
	if (state.current !== '' && state.current !== '\n') {
		const token = mkToken('TOKEN', state.current, {
			start: {...state.loc.start},
			end: {...state.loc.previous}
		}, state.expansion);

		/* if (state.expansion && state.expansion.length) {
			token.expansion = state.expansion;
		}*/

		return [token];
	}
	return [];
};

exports.operatorTokens = function operatorTokens(state) {
	const token = mkToken(
		operators[state.current],
		state.current, {
			start: {...state.loc.start},
			end: {...state.loc.previous}
		}
	);

	return [token];
};

exports.newLine = function newLine() {
	return mkToken('NEWLINE', '\n');
};

exports.continueToken = function newLine() {
	return mkToken('CONTINUE', '');
};

exports.eof = function newLine() {
	return mkToken('EOF', '');
};

exports.isPartOfOperator = function isPartOfOperator(text) {
	return Object.keys(operators).some(op => op.slice(0, text.length) === text);
};

exports.isOperator = function isOperator(text) {
	return hasOwnProperty(operators, text);
};

exports.isSpecialParameter = function isSpecialParameter(char) {
	return char.match(/^[0-9\-!@#\?\*\$]$/);
};

exports.appendEmptyExpansion = function appendEmptyExpansion(state) {
	return (state.expansion || []).concat({
		loc: {start: {...state.loc.current}}
	});
};

exports.advanceLoc = function advanceLoc(state, char) {
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
};
