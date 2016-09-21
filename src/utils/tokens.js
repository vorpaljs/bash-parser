'use strict';
const filter = require('filter-obj');

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

exports.mkToken = function mkToken(type, value, loc) {
	const tk = new Token({type, value, loc});
	Object.freeze(tk);
	return tk;
};

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
