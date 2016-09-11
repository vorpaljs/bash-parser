'use strict';
const lookahead = require('iterable-lookahead');
const TokenDelimiterState = require('./token-delimiter-state');

/*
	delimit tokens on source according to rules defined
	in http://pubs.opengroup.org/onlinepubs/9699919799/utilities/V3_chap02.html#tag_18_03
*/

function * tryAddCharacterToOperator(currentCharacter, state, result) {
	// RULE 2 -If the previous character was used as part of an operator and the
	// current character is not quoted and can be used with the current characters
	// to form an operator, it shall be used as part of that (operator) token.
	if (state.canAppendToOperator(currentCharacter)) {
		state.appendToOperator(currentCharacter);
		state.advanceLoc(currentCharacter);
		result.shouldReturn = true;
		return;
	}

	// RULE 3 - If the previous character was used as part of an operator and the
	// current character cannot be used with the current characters to form an operator,
	// the operator containing the previous character shall be delimited.
	if (state.currentTokenIsCompleteOperator()) {
		yield state.finalizeCurrentToken();
	} else {
		// The current token cannot form an OPERATOR by itself,
		// even if it could start one,
		// so it is emitted as a normal token.
		state.setGenericToken(state.token.OPERATOR);
		yield state.finalizeCurrentToken();
	}

	state.setEmptyToken();
}

function * emitCurrentTokenIfNotEmpty(currentCharacter, state) {
	if (!state.currentTokenIsEmpty()) {
		yield state.finalizeCurrentToken();
	}

	state.setEmptyToken();
	state.advanceLoc(currentCharacter);
}

function tryStartQuoting(currentCharacter, state) {
	state.setCurrentQuoting(currentCharacter);

	// if (currentCharacter !== '\\') {
	if (state.currentTokenIsGeneric()) {
		state.appendToGenericToken(currentCharacter);
	} else {
		state.setGenericToken(currentCharacter);
	}
	// }

	state.advanceLoc(currentCharacter);
}

function * addCharacter(currentCharacter, state) {
	const result = {shouldReturn: false};

	if (state.canEndComment(currentCharacter)) {
		state.endComment();
	} else if (state.canContinueComment(currentCharacter)) {
		state.advanceLoc(currentCharacter);
		return;
	}

	if (state.currentTokenIsOperatorPart()) {
		yield * tryAddCharacterToOperator(currentCharacter, state, result);
		if (result.shouldReturn) {
			return;
		}
	}

	// RULE 4 - If the current character is <backslash>, single-quote, or
	// double-quote and it is not quoted, it shall affect quoting for subsequent
	// characters up to the end of the quoted text.
	if (state.canStartQuoting(currentCharacter)) {
		return tryStartQuoting(currentCharacter, state);
	}

	if (state.isExpandingCommand() && state.isArithmeticExpansionStart(currentCharacter)) {
		state.setArithmeticQuoting();
	}

	// <backslash> quoting should work within double quotes
	if (currentCharacter === '\\' && state.isQuotingDouble()) {
		state.setEscaping();
		state.appendToGenericToken(currentCharacter);
		state.advanceLoc(currentCharacter);
		return;
	}

	// RULE 6 - If the current character is not quoted and can be used as the
	// first character of a new operator, the current token (if any) shall be
	// delimited. The current character shall be used as the beginning of the
	// next (operator) token.
	if (state.isOperatorStart(currentCharacter) && !state.isQuoting()) {
		if (!state.currentTokenIsEmpty()) {
			yield state.finalizeCurrentToken();
		}
		state.setOperatorToken(currentCharacter);

		state.advanceLoc(currentCharacter);
		return;
	}

	// RULE 7 - If the current character is an unquoted <newline>, the current
	// token shall be delimited.
	if (!state.isEscaping() && currentCharacter === '\n') {
		// emit current token if not empty
		if (!state.currentTokenIsEmpty()) {
			yield state.finalizeCurrentToken();
		}

		state.resetQuoting();
		state.setNewLineToken();
		state.savePreviousLoc();
		yield * emitCurrentTokenIfNotEmpty(currentCharacter, state);
		return;
	}

	// RULE 8 - If the current character is an unquoted <blank>, any token
	// containing the previous character is delimited and the current
	// character shall be discarded.
	// console.log(currentCharacter.match(/\s/), quoting)
	if (!state.isQuoting() && currentCharacter.match(/\s/)) {
		yield * emitCurrentTokenIfNotEmpty(currentCharacter, state);
		return;
	}

	if (state.isEscaping() && currentCharacter === '\n') {
		state.advanceLoc(currentCharacter);
		currentCharacter = '';
	}

	if (state.isEscaping()) {
		// reset character escaping if setted.
		state.resetEscaping();
	}

	if (state.canCloseCurrentQuoting(currentCharacter)) {
		// Reset single or double quoting on close
		state.resetQuoting();
	}

	if (state.currentTokenIsGeneric()) {
		// RULE 9 - If the previous character was part of a word, the current
		// character shall be appended to that word.
		state.appendToGenericToken(currentCharacter);
		state.advanceLoc(currentCharacter);
		return;
	} else if (state.canStartComment(currentCharacter)) {
		// RULE 10 - If the current character is a '#', it and all subsequent
		// characters up to, but excluding, the next <newline> shall be discarded
		// as a comment. The <newline> that ends the line is not considered part
		// of the comment.

		state.startComment();
	} else if (currentCharacter === '\n') {
		state.setEmptyToken();
	} else {
		// RULE 11 - The current character is used as the start of a new word.
		state.setGenericToken(currentCharacter);
	}

	state.advanceLoc(currentCharacter);
}

module.exports = function * tokenDelimiter(source) {
	const charIterator = lookahead(source, 2);
	const state = new TokenDelimiterState(charIterator);

	for (const currentCharacter of charIterator) {
		yield * addCharacter(currentCharacter, state);
	}

	// RULE 1 - If the end of input is recognized, the current token shall
	// be delimited. If there is no current token, the end-of-input indicator
	// shall be returned as the token.
	yield * emitCurrentTokenIfNotEmpty('', state);

	state.setEOFToken();
	yield state.finalizeCurrentToken();
};
