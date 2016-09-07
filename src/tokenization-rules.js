'use strict';
const hasOwnProperty = require('has-own-property');
const values = require('object-values');
const lookahead = require('iterable-lookahead');
const operators = require('./operators');
const words = require('./reserved-words');
const identifySimpleCommandNames = require('./identify-simplecommand-names');
const isOperator = require('./io-file-operators').isOperator;

exports.identifySimpleCommandNames = identifySimpleCommandNames;

exports.identifyMaybeSimpleCommands = function * (tokens) {
	let maybeStartOfSimpleCommand = true;
	for (const tk of tokens) {
		tk._ = (tk._ || {});
		if (tk.WORD || tk.IO_NUMBER) {
			tk._.maybeStartOfSimpleCommand = maybeStartOfSimpleCommand;
		}
		// evaluate if next token could start a simple command
		maybeStartOfSimpleCommand = Boolean(
			tk.SEPARATOR_OP || tk.OPEN_PAREN ||
			tk.CLOSE_PAREN || tk.NEWLINE || tk.NEWLINE_LIST ||
			tk.TOKEN === ';' || tk.PIPE ||
			tk.OR_IF || tk.PIPE || tk.AND_IF ||
			(!tk.For && !tk.In && !tk.Case && values(words).some(word => hasOwnProperty(tk, word)))
		);

		yield tk;
	}
};

function copyTempObject(tk, newTk) {
	if (hasOwnProperty(tk, '_')) {
		newTk._ = tk._;
	}
	return newTk;
}

exports.operatorTokens = function * (tokens) {
	for (const tk of tokens) {
		if (hasOwnProperty(operators, tk.OPERATOR)) {
			yield copyTempObject(tk, {
				[operators[tk.OPERATOR]]: tk.OPERATOR,
				loc: tk.loc
			});
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
		if (hasOwnProperty(words, tk.TOKEN)) {
			yield copyTempObject(tk, {
				[words[tk.TOKEN]]: tk.TOKEN,
				loc: tk.loc
			});
		} else if (defined(tk.TOKEN)) {
			const word = copyTempObject(tk, {
				WORD: tk.TOKEN,
				loc: tk.loc
			});

			if (tk.expansion) {
				word.expansion = tk.expansion;
			}

			yield word;
		} else {
			yield tk;
		}
	}
};

// TODO: is this really necessary?
exports.replaceLineTerminationToken = function * (tokens) {
	for (const tk of tokens) {
		if (tk.TOKEN === ';') {
			yield {
				'_': tk._,
				';': tk.TOKEN,
				'loc': tk.loc
			};
		} else if (tk.OPERATOR === ';') {
			yield {
				'_': tk._,
				';': tk.OPERATOR,
				'loc': tk.loc
			};
		} else {
			yield tk;
		}
	}
};

exports.forNameVariable = function * (tokens) {
	let lastToken = {};
	for (const tk of tokens) {
		if (lastToken.For && tk.WORD && tk.WORD.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
			yield copyTempObject(tk, {
				NAME: tk.WORD,
				loc: tk.loc
			});
		} else {
			yield tk;
		}
		lastToken = tk;
	}
};

exports.functionName = function * (tokens) {
	let canBeFunctionName = true;
	const tokensIterator = lookahead(tokens, 2);
	let tk;
	for (tk of tokensIterator) {
		// apply only on valid positions
		// (start of simple commands)
		if (!canBeFunctionName) {
			// evaluate if this token could
			// end a statement.
			if (tk.NEWLINE || tk.TOKEN === ';') {
				canBeFunctionName = true;
			}
		} else if (!tk.WORD && !tk.OPEN_PAREN && !tk.CLOSE_PAREN) {
			canBeFunctionName = false;
		} else if (
			tk.WORD &&
			tokensIterator.ahead(2) &&
			tokensIterator.ahead(1).OPEN_PAREN &&
			tokensIterator.ahead(2).CLOSE_PAREN
		) {
			tk.NAME = tk.WORD;
			delete tk.maybeSimpleCommandName;
			delete tk.WORD;
		}

		yield tk;
	}
};

exports.ioNumber = function * (tokens) {
	let lastToken = {EMPTY: true};
	for (const tk of tokens) {
		// console.log(lastToken, isOperator(lastToken));
		if (lastToken.WORD && lastToken.WORD.match(/^[0-9]+$/) &&
			isOperator(tk)) {
			lastToken = copyTempObject(lastToken, {
				IO_NUMBER: lastToken.WORD,
				loc: lastToken.loc
			});
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

exports.removeTempObject = function * (tokens) {
	for (const tk of tokens) {
		delete tk._;
		yield tk;
	}
};

function isValidName(text) {
	return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(text);
}

exports.assignmentWord = function * (tokens) {
	let canBeCommandPrefix = true;
	for (const tk of tokens) {
		// apply only on valid positions
		// (start of simple commands)
		if (tk._.maybeStartOfSimpleCommand) {
			canBeCommandPrefix = true;
		}

		// check if it is an assignment
		if (canBeCommandPrefix && tk.WORD && tk.WORD.indexOf('=') > 0 && (
				// left part must be a valid name
				isValidName(tk.WORD.slice(0, tk.WORD.indexOf('=')))

			)) {
			yield copyTempObject(tk, {
				ASSIGNMENT_WORD: tk.WORD,
				expansion: tk.expansion,
				loc: tk.loc
			});
			continue;
		}

		canBeCommandPrefix = false;
		yield tk;
	}
};

/* resolve a conflict in grammar by tokenize multiple NEWLINEs as a
newline_list token (it was a rule in POSIX grammar) */
exports.newLineList = function * (tokens) {
	let lastToken = {EMPTY: true};
	for (const tk of tokens) {
		if (tk.NEWLINE) {
			if (lastToken.NEWLINE_LIST) {
				lastToken.NEWLINE_LIST += '\n';
				// TODO: alter loc
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

/* resolve a conflict in grammar by tokenize linebreak+in
tokens as a new  linebreak_in */
exports.linebreakIn = function * (tokens) {
	let lastToken;

	for (const tk of tokens) {
		if (tk.In && lastToken.NEWLINE) {
			lastToken.LINEBREAK_IN = '\nin';
			// TODO: alter loc
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
			// TODO: alter loc
			continue;
		}

		if (tk[';'] || tk.OPERATOR === '&') {
			tk.SEPARATOR_OP = (tk[';'] || '') + (tk.OPERATOR || '');
			// TODO: alter loc
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

