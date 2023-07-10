'use strict';

const map = require('../../vendored/map-iterable');
const tokenOrEmpty = require('../../utils/tokens').tokenOrEmpty;

const convertToWord = () => map(tk => {
	// TOKEN tokens are converted to WORD tokens
	if (tk.is('TOKEN')) {
		return tk.changeTokenType('WORD', tk.value);
	}

	// other tokens are amitted as-is
	return tk;
});

function start(state, source, reducers) {
	const char = source && source.shift();

	if (char === undefined) {
		return {
			nextReduction: reducers.end,
			tokensToEmit: tokenOrEmpty(state),
			nextState: state.resetCurrent().saveCurrentLocAsStart()
		};
	}

	if (state.escaping && char === '\n') {
		return {
			nextReduction: reducers.start,
			nextState: state.setEscaping(false).removeLastChar()
		};
	}

	if (!state.escaping && char === '\\') {
		return {
			nextReduction: reducers.start,
			nextState: state.setEscaping(true).appendChar(char)
		};
	}

	if (!state.escaping && char === '\'') {
		return {
			nextReduction: reducers.singleQuoting,
			nextState: state.appendChar(char)
		};
	}

	if (!state.escaping && char === '"') {
		return {
			nextReduction: reducers.doubleQuoting,
			nextState: state.appendChar(char)
		};
	}

	if (!state.escaping && char === '$') {
		return {
			nextReduction: reducers.expansionStart,
			nextState: state.appendChar(char).appendEmptyExpansion()
		};
	}

	if (!state.escaping && char === '`') {
		return {
			nextReduction: reducers.expansionCommandTick,
			nextState: state.appendChar(char).appendEmptyExpansion()
		};
	}

	return {
		nextReduction: reducers.start,
		nextState: state.appendChar(char).setEscaping(false)
	};
}

module.exports = {
	inherits: 'posix',
	init: posixMode => {
		const phaseCatalog = posixMode.phaseCatalog;
		const lexerPhases = [
			convertToWord,
			phaseCatalog.parameterExpansion,
			phaseCatalog.arithmeticExpansion,
			phaseCatalog.commandExpansion,
			phaseCatalog.tildeExpanding,
			phaseCatalog.parameterExpansion.resolve,
			phaseCatalog.commandExpansion.resolve,
			phaseCatalog.arithmeticExpansion.resolve,
			phaseCatalog.fieldSplitting.split,
			phaseCatalog.pathExpansion,
			phaseCatalog.quoteRemoval,
			phaseCatalog.defaultNodeType
		];
		const reducers = Object.assign({}, posixMode.tokenizer.reducers, {start});

		const tokenizer = () => posixMode.tokenizer({}, reducers);

		return Object.assign({}, posixMode, {lexerPhases, tokenizer});
	}
};
