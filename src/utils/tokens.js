'use strict';

exports.mkToken = function mkToken(type, value, loc) {
	const tk = {type, value, _: {}};
	if (loc) {
		tk.loc = loc;
	}
	Object.defineProperty(tk, type, {value, enumerable: true});
	Object.freeze(tk);
	return tk;
};

exports.appendTo = function appendTo(tk, chunk) {
	const newTk = Object.assign({}, tk);
	const value = tk.value + chunk;
	Object.defineProperty(newTk, newTk.type, {value, enumerable: true});

	Object.freeze(newTk);
	return newTk;
};

exports.changeTokenType = function changeTokenType(tk, type, value) {
	const newTk = {type, value, loc: tk.loc, _: tk._};
	if (tk.expansion) {
		newTk.expansion = tk.expansion;
	}
	Object.defineProperty(newTk, type, {value, enumerable: true});
	Object.freeze(newTk);
	return newTk;
};

exports.setValue = function setValue(tk, value) {
	const newTk = Object.assign({}, tk, {value});
	Object.defineProperty(newTk, tk.type, {value, enumerable: true});
	Object.freeze(newTk);
	return newTk;
};

exports.alterValue = function setValue(tk, value) {
	const originalText = tk.originalText || tk.value;
	const newTk = Object.assign({}, tk, {value, originalText});
	Object.defineProperty(newTk, tk.type, {value, enumerable: true});
	Object.freeze(newTk);
	return newTk;
};

exports.addExpansions = function addExpansions(tk) {
	const newTk = Object.assign({}, tk, {expansion: []});
	Object.freeze(newTk);
	return newTk;
};
