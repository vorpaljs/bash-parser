import hasOwnProperty from 'has-own-property';
import filter from 'filter-obj';
import operators from '../modes/posix/enums/operators';

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

export const token = args => new Token(args);

export function mkToken(type, value, loc, expansion) {
	const tk = new Token({type, value, loc});
	if (expansion && expansion.length) {
		tk.expansion = expansion;
	}

	return tk;
}

export function mkFieldSplitToken(joinedTk, value, fieldIdx) {
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
}

export const appendTo = (tk, chunk) => tk.appendTo(chunk);
export const changeTokenType = (tk, type, value) => tk.changeTokenType(type, value);
export const setValue = (tk, value) => tk.setValue(value);
export const alterValue = (tk, value) => tk.alterValue(value);
export const addExpansions = tk => tk.addExpansions();
export const setExpansions = (tk, expansion) => tk.setExpansions(expansion);

export function tokenOrEmpty(state) {
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
}

export function operatorTokens(state) {
	const token = mkToken(
		operators[state.current],
		state.current, {
			start: Object.assign({}, state.loc.start),
			end: Object.assign({}, state.loc.previous)
		}
	);

	return [token];
}

export function newLine() {
	return mkToken('NEWLINE', '\n');
}

export function continueToken(expectedChar) {
	return mkToken('CONTINUE', expectedChar);
}

export function eof() {
	return mkToken('EOF', '');
}

export function isPartOfOperator(text) {
	return Object.keys(operators).some(op => op.slice(0, text.length) === text);
}

export function isOperator(text) {
	return hasOwnProperty(operators, text);
}

export const applyTokenizerVisitor = visitor => (tk, idx, iterable) => {
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
