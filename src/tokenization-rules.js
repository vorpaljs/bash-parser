'use strict';
const operators = require('./operators');
const words = require('./reserved-words');
exports.operatorTokens = function * (tokens) {
	for (const tk of tokens) {
		if (operators.hasOwnProperty(tk.OPERATOR)) {
			yield {[operators[tk.OPERATOR]]: tk.OPERATOR};
		} else {
			yield tk;
		}
	}
};

function defined(v) {
	return v !== undefined;
}

exports.reservedWords = function * (tokens) {
	for (const tk of tokens) {
		if (words.hasOwnProperty(tk.TOKEN)) {
			yield {[words[tk.TOKEN]]: tk.TOKEN};
		} else if (defined(tk.TOKEN)) {
			yield {WORD: tk.TOKEN};
		} else {
			yield tk;
		}
	}
};
// is this really necessary?
exports.replaceLineTerminationToken = function * (tokens) {
	for (const tk of tokens) {
		if (tk.TOKEN === ';') {
			yield {';': tk.TOKEN};
		} else if (tk.OPERATOR === ';') {
			yield {';': tk.OPERATOR};
		} else {
			yield tk;
		}
	}
};

exports.forNameVariable = function * (tokens) {
	let lastToken = {};
	for (const tk of tokens) {
		if (lastToken.For && tk.WORD && tk.WORD.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
			yield {NAME: tk.WORD};
		} else {
			yield tk;
		}
		lastToken = tk;
	}
};

exports.functionName = function * (tokens) {
	const lastTokens = [];
	let canBeFunctionName = true;
	for (const tk of tokens) {
		// console.log(
		//	 'functionName:tk',
		//	 tk
		// );
		// apply only on valid positions
		// (start of simple commands)
		if (!canBeFunctionName) {
			// evaluate if this token could
			// end a statement.
			if (tk.NEWLINE || tk.TOKEN === ';') {
				canBeFunctionName = true;
			}
		} else if (!tk.WORD && !tk.OPEN_PAREN && !tk.CLOSE_PAREN && !tk.Lbrace) {
			// console.log('!canBeFunctionName')
			canBeFunctionName = false;
		} else if (
			tk.Lbrace &&
			lastTokens.length >= 3 &&
			lastTokens[2].CLOSE_PAREN &&
			lastTokens[1].OPEN_PAREN &&
			lastTokens[0].WORD
		) {
			const prevTk = lastTokens[0];
			prevTk.NAME = prevTk.WORD;
			delete prevTk.WORD;
			// console.log('MATCHES!',lastTokens[0] )
		}

		if (lastTokens.length > 10) {
			const tky = lastTokens.shift();
			// console.log(lastTokens.length, {tky})
			yield tky;
		}
		lastTokens.push(tk);
	}
// console.log('fine', lastTokens)
	while (lastTokens.length) {
		const tky = lastTokens.shift();
			// console.log({tky})
		yield tky;
	}
};

exports.ioNumber = function * (tokens) {
	let lastToken = {EMPTY: true};
	for (const tk of tokens) {
		if (lastToken.WORD && lastToken.WORD.match(/^[0-9]+$/) &&
			(tk.GREAT || tk.LESS)) {
			lastToken = {IO_NUMBER: lastToken.WORD};
		}
		if (!lastToken.EMPTY) {
			yield lastToken;
		}
		lastToken = tk;
	}
	if (!lastToken.EMPTY) {
		yield lastToken;
	}
};

exports.assignmentWord = function * (tokens) {
	let canBeCommandPrefix = true;
	for (const tk of tokens) {
		// apply only on valid positions
		// (start of simple commands)
		if (!canBeCommandPrefix) {
			// evaluate if this token could
			// end a statement.
			if (tk.NEWLINE || tk.TOKEN === ';') {
				canBeCommandPrefix = true;
			}
			yield tk;
		} else if (tk.TOKEN === undefined) {
			// apply only for token
			// TODO: allow also redirections
			canBeCommandPrefix = false;
			yield tk;
		} else if (tk.TOKEN.indexOf('=') > 0) {
			yield {ASSIGNMENT_WORD: tk.TOKEN};
		} else {
			canBeCommandPrefix = false;
			yield tk;
		}
	}
};
