'use strict';
const hasOwnProperty = require('has-own-property');
const values = require('object-values');
const compose = require('compose-function');
const map = require('map-iterable');
const lookahead = require('iterable-lookahead');
const operators = require('./operators');
const reservedWords = require('./reserved-words');
const identifySimpleCommandNames = require('./identify-simplecommand-names');
const isOperator = require('./io-file-operators').isOperator;

exports.identifySimpleCommandNames = identifySimpleCommandNames;

exports.identifyMaybeSimpleCommands = compose(map((tk, idx, iterable) => {
	const last = iterable.behind(1) || {EMPTY: true};

	// evaluate based on last token
	tk._ = {
		maybeStartOfSimpleCommand: Boolean(
			last.EMPTY || last.SEPARATOR_OP || last.OPEN_PAREN ||
			last.CLOSE_PAREN || last.NEWLINE || last.NEWLINE_LIST ||
			last.TOKEN === ';' || last.PIPE ||
			last.OR_IF || last.PIPE || last.AND_IF ||
			(!last.For && !last.In && !last.Case && values(reservedWords).some(word => hasOwnProperty(last, word)))
		)
	};

	return tk;
}), lookahead);

function copyTempObject(tk, newTk) {
	if (hasOwnProperty(tk, '_')) {
		newTk._ = tk._;
	}
	return newTk;
}

exports.operatorTokens = map(tk => {
	if (hasOwnProperty(operators, tk.OPERATOR)) {
		return copyTempObject(tk, {
			[operators[tk.OPERATOR]]: tk.OPERATOR,
			loc: tk.loc
		});
	}

	return tk;
});

function defined(v) {
	return v !== undefined;
}

exports.reservedWords = map(tk => {
	// TOKEN tokens consisting of a reserved word
	// are converted to their own token types
	if (hasOwnProperty(reservedWords, tk.TOKEN)) {
		return copyTempObject(tk, {
			[reservedWords[tk.TOKEN]]: tk.TOKEN,
			loc: tk.loc
		});
	}

	// otherwise, TOKEN tokens are converted to
	// WORD tokens
	if (defined(tk.TOKEN)) {
		return copyTempObject(tk, {
			WORD: tk.TOKEN,
			loc: tk.loc
		});
	}

	// othet tokens are amitted as-is
	return tk;
});

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

exports.forNameVariable = compose(map((tk, idx, iterable) => {
	let lastToken = iterable.behind(1) || {};

	// if last token is For and current token form a valid name
	// type of token is changed from WORD to NAME

	if (lastToken.For && tk.WORD && isValidName(tk.WORD)) {
		return copyTempObject(tk, {
			NAME: tk.WORD,
			loc: tk.loc
		});
	}

	return tk;
}), lookahead);

exports.functionName = compose(map((tk, idx, iterable) => {
	// apply only on valid positions
	// (start of simple commands)
	// if token can form the name of a function,
	// type of token is changed from WORD to NAME
	if (
		tk._.maybeStartOfSimpleCommand &&
		tk.WORD &&
		iterable.ahead(2) &&
		iterable.ahead(1).OPEN_PAREN &&
		iterable.ahead(2).CLOSE_PAREN
	) {
		tk.NAME = tk.WORD;
		delete tk.maybeSimpleCommandName;
		delete tk.WORD;
	}

	return tk;
}), lookahead.depth(2));

exports.ioNumber = compose(map((tk, idx, iterable) => {
	const next = iterable.ahead(1);

	if (tk && tk.WORD && tk.WORD.match(/^[0-9]+$/) && isOperator(next)) {
		return copyTempObject(tk, {
			IO_NUMBER: tk.WORD,
			loc: tk.loc
		});
	}

	return tk;
}), lookahead);

exports.removeTempObject = function * (tokens) {
	for (const tk of tokens) {
		delete tk._;
		yield tk;
	}
};

function isValidName(text) {
	return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(text);
}

exports.assignmentWord = map((tk, idx, ctx) => {
	// apply only on valid positions
	// (start of simple commands)
	if (tk._.maybeStartOfSimpleCommand) {
		ctx.commandPrefixNotAllowed = false;
	}

	// check if it is an assignment
	if (!ctx.commandPrefixNotAllowed && tk.WORD && tk.WORD.indexOf('=') > 0 && (
			// left part must be a valid name
			isValidName(tk.WORD.slice(0, tk.WORD.indexOf('=')))
		)) {
		return copyTempObject(tk, {
			ASSIGNMENT_WORD: tk.WORD,
			expansion: tk.expansion,
			loc: tk.loc
		});
	}

	ctx.commandPrefixNotAllowed = true;
	return tk;
});

/* resolve a conflict in grammar by tokenize multiple NEWLINEs as a
newline_list token (it was a rule in POSIX grammar) */
exports.newLineList = function * (tokens) {
	let lastToken = {EMPTY: true};
	for (const tk of tokens) {
		if (tk.NEWLINE) {
			if (lastToken.NEWLINE_LIST) {
				lastToken.NEWLINE_LIST += '\n';
				if (lastToken.loc) {
					lastToken.loc.endLine++;
				}
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

