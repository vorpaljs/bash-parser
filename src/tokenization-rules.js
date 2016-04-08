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
		// apply only on valid positions
		// (start of simple commands)
		if (!canBeFunctionName) {
			// evaluate if this token could
			// end a statement.
			if (tk.NEWLINE || tk.TOKEN === ';') {
				canBeFunctionName = true;
			}
		} else if (!tk.WORD && !tk.OPEN_PAREN && !tk.CLOSE_PAREN) {
			// console.log('!canBeFunctionName')
			canBeFunctionName = false;
		} else if (
			tk.CLOSE_PAREN &&
			lastTokens.length >= 2 &&
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

		// evaluate if this token could
		// end a simple command.
		if (tk.NEWLINE || tk.NEWLINE_LIST || tk.TOKEN === ';' || tk.PIPE) {
			canBeCommandPrefix = true;
			yield tk;
			continue;
		}

		// check if it is an assignment
		if (canBeCommandPrefix && tk.TOKEN && tk.TOKEN.indexOf('=') > 0 && (
				// quoted token should be skipped
				!(tk.TOKEN.startsWith('\'') || tk.TOKEN.startsWith('"'))
			)) {
			yield {ASSIGNMENT_WORD: tk.TOKEN};
			continue;
		}

		canBeCommandPrefix = false;
		yield tk;
	}
};

/* resolve a conflict in grammar by
tokenize multiple NEWLINEs as a
newline_list token (it was a rule in POSIX grammar)
*/
exports.newLineList = function * (tokens) {
	let lastToken = {EMPTY: true};
	for (const tk of tokens) {
		if (tk.NEWLINE) {
			if (lastToken.NEWLINE_LIST) {
				lastToken.NEWLINE_LIST += '\n';
				continue;
			} else {
				tk.NEWLINE_LIST = '\n';
				delete tk.NEWLINE;
			}
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

/* resolve a conflict in grammar by
tokenize linebreak+in tokens as a new  linebreak_in
*/
exports.linebreakIn = function * (tokens) {
	let lastToken;

	for (const tk of tokens) {
		if (tk.In && lastToken.NEWLINE) {
			lastToken.LINEBREAK_IN = '\nin';
			delete lastToken.NEWLINE;
			continue;
		}

		if (lastToken) {
			yield lastToken;
		}
		lastToken = tk;
	}

	if (lastToken) {
		yield lastToken;
	}
};

/*
resolve a conflict in grammar by
tokenize the former rule:

separator_op     : '&'
				 | ';'
				 ;
separator       : separator_op
				 | separator_op NEWLINE_LIST
				 | NEWLINE_LIST

with a new separator_op token, the rule became:

separator : separator_op
				 | NEWLINE_LIST

*/
exports.separator = function * (tokens) {
	let lastToken = {EMPTY: true};

	for (const tk of tokens) {
		if (tk.NEWLINE_LIST && lastToken.SEPARATOR_OP) {
			lastToken.SEPARATOR_OP += tk.NEWLINE_LIST;
			continue;
		}

		if (tk[';'] || tk.OPERATOR === '&') {
			tk.SEPARATOR_OP = (tk[';'] || '') + (tk.OPERATOR || '');
			delete tk[';'];
			delete tk.OPERATOR;
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

