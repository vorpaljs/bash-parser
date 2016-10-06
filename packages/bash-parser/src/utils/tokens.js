'use strict';
const hasOwnProperty = require('has-own-property');
const filter = require('filter-obj');
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

	appendTo(chunk) {
		return new Token(Object.assign({}, this, {value: this.value + chunk}));
	}
	changeTokenType(type, value) {
		return new Token({type, value, loc: this.loc, _: this._, expansion: this.expansion});
	}
	setValue(value) {
		return new Token(Object.assign({}, this, {value}));
	}
	alterValue(value) {
		return new Token(Object.assign({}, this, {value, originalText: this.originalText || this.value}));
	}
	addExpansions() {
		return new Token(Object.assign({}, this, {expansion: []}));
	}
	setExpansions(expansion) {
		return new Token(Object.assign({}, this, {expansion}));
	}
}

exports.token = args => new Token(args);

function mkToken(type, value, loc, expansion) {
	const tk = new Token({type, value, loc});
	if (expansion && expansion.length) {
		tk.expansion = expansion;
	}

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

	return tk;
};

exports.appendTo = (tk, chunk) => tk.appendTo(chunk);
exports.changeTokenType = (tk, type, value) => tk.changeTokenType(type, value);
exports.setValue = (tk, value) => tk.setValue(value);
exports.alterValue = (tk, value) => tk.alterValue(value);
exports.addExpansions = tk => tk.addExpansions();
exports.setExpansions = (tk, expansion) => tk.setExpansions(expansion);

exports.tokenOrEmpty = function tokenOrEmpty(state) {
	if (state.current !== '' && state.current !== '\n') {
		const expansion = (state.expansion || []).map(xp => {
			// console.log('aaa', {token: state.loc, xp: xp.loc});
			return Object.assign({}, xp, {loc: {
				start: xp.loc.start.char - state.loc.start.char,
				end: xp.loc.end.char - state.loc.start.char
			}});
		});
		const token = mkToken('TOKEN', state.current, {
			start: Object.assign({}, state.loc.start),
			end: Object.assign({}, state.loc.previous)
		}, expansion);

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
			start: Object.assign({}, state.loc.start),
			end: Object.assign({}, state.loc.previous)
		}
	);

	return [token];
};

exports.newLine = function newLine() {
	return mkToken('NEWLINE', '\n');
};

exports.continueToken = function continueToken(expectedChar) {
	return mkToken('CONTINUE', expectedChar);
};

exports.eof = function eof() {
	return mkToken('EOF', '');
};

exports.isPartOfOperator = function isPartOfOperator(text) {
	return Object.keys(operators).some(op => op.slice(0, text.length) === text);
};

exports.isOperator = function isOperator(text) {
	return hasOwnProperty(operators, text);
};

exports.applyTokenizerVisitor = visitor => (tk, idx, iterable) => {
	if (hasOwnProperty(visitor, tk.type)) {
		const visit = visitor[tk.type];

		return visit(tk, iterable);
	}

	if (hasOwnProperty(visitor, 'defaultMethod')) {
		const visit = visitor.defaultMethod;
		return visit(tk, iterable);
	}

	return tk;
};
