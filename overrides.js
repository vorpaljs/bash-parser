/**
 * Functions defined here are stringified and injected into grammar actions, so
 * their bodies are actually run in a *different* scope.
 *
 * This means that function arguments are meaningless, and the function bodies
 * actually operate on variable names defined in the grammar file. We still
 * define them as arguments for readability and so that these functions could
 * potentially be used outside of the generated parser.
 *
 * This also explains the "global" functions used here (such as `text()`)...
 * they are defined by the generated parser.
 */

var isArray = require('isarray'); // not actually used, just for readability

var rules = exports.rules = {};

exports.initializer = [
	'var isArray = require("isarray")',
	'var map = require("array-map")',
	function join(arr) {
		return arr.join('');
	},
	function literal(string) {
		return {
			type: 'literal',
			value: isArray(string) ? string.join('') : string
		};
	},
	function first(arr) {
		return arr[0];
	},
	function second(arr) {
		return arr[1];
	},
	function flattenConcatenation(pieces) {
		/* eslint-disable no-warning-comments */
		// TODO - this also sucks, it's probably on the order of n^4
		/* eslint-enable no-warning-comments */
		var result = [pieces[0]];
		var len = pieces.length;
		var prev = pieces[0];
		var current;

		for (var i = 1; i < len; i++) {
			current = pieces[i];
			if (current.type === 'concatenation') {
				current = flattenConcatenation(current.pieces);
			}

			if (current.type === 'concatenation') {
				// it's still a concatenation, append it's pieces to ours
				result = result.concat(current.pieces);
			} else if (
				(current.type === 'literal' || current.type === 'glob') &&
				(prev.type === 'literal' || prev.type === 'glob')) {
				// globs & literals can be merged
				prev.value += current.value;

				if (prev.type !== 'glob' && current.type === 'glob') {
					// globs are infectious
					prev.type = 'glob';
				}
			} else {
				result.push(current);
				prev = current;
			}
		}
		return result.length === 1 ? result[0] : {
			type: 'concatenation',
			pieces: result
		};
	}
].join('\n');

rules.script = function (statements) {
	return statements || [];
};

rules.statementList = function (first, tail, last, head, map) {
	var statements = [head];
	var prev = head;
	map(tail, function (spaceOpSpaceCmd /* , i , cmds */) {
		setOperator(spaceOpSpaceCmd[0], prev);
		statements.push(prev = spaceOpSpaceCmd[2]);
	});

	if (last) {
		if (!prev) {
			debugger;		// eslint-disable-line no-debugger
		}
		setOperator(last, prev);
	}

	return statements;

	function setOperator(operator, command) {
		while (command.next) {
			command = command.next;
		}
		command.control = operator;
	}
};

rules.subshell = function (statements) {
	return {
		type: 'subshell',
		statements: statements
	};
};

rules.conditionalLoop = function (kind, test, body) {
	return {
		type: kind + 'Loop',
		test: test,
		body: body
	};
};

rules.forLoop = function (loopVar, subjects, body, second) {
	return {
		type: 'forLoop',
		loopVariable: loopVar,
		subjects: subjects[1].map(second),
		body: body
	};
};

rules.ifBlock = function (test, body, elifBlocks, elseBody) {
	return {
		type: 'ifElse',
		test: test,
		body: body,
		elifBlocks: elifBlocks.length ? elifBlocks : null,
		elseBody: elseBody ? elseBody[1] : null
	};
};

rules.elifBlock = function (test, body) {
	return {
		type: 'ifElse',
		test: test,
		body: body
	};
};

rules.time = function (flags, statements) {
	return {
		type: 'time',
		flags: flags,
		command: statements
	};
};

rules.condition = function bare(test) {
	return test;
};

rules.statement = function (statement, next) {
	if (typeof next !== 'undefined' && next) {
		next = next[1];
		statement.control = next[0];
		statement.next = next[1];
	} else {
		statement.control = ';';
		statement.next = null;
	}
	return statement;
};

rules.command = function (pre, name, post, pipe, map, first, second) {
	var command = {
		type: 'command',
		command: name,
		args: [],
		redirects: [],
		env: {},
		control: ';',
		next: null
	};

	map(pre, first).concat(map(post, second)).forEach(function (token) {
		if (!token || !token.type) {
			return;
		}
		switch (token.type) {
			case 'moveFd':
			case 'duplicateFd':
			case 'redirectFd':
				return command.redirects.push(token);
			case 'variableAssignment':
				command.env[token.name] = token.value;
				return token.value;
			default:
				command.args.push(token);
		}
	});

	if (pipe) {
		command.redirects.push(pipe[1]);
	}

	return command;
};

rules.chainedStatement = function (operator, statement) {
	return [operator, statement];
};

rules.commandName = function (name) {
	return name;
};

rules.controlOperator = function (op) {
	return op === '\n' ? ';' : op;
};

rules.processSubstitution = function (rw, commands) {
	return {
		type: 'processSubstitution',
		readWrite: rw,
		commands: commands
	};
};

rules.environmentVariable = function (name) {
	return {type: 'variable', name: name};
};

rules.variableSubstitution = function (join, expr) {
	return {
		type: 'variableSubstitution',
		/* eslint-disable no-warning-comments */
		expression: join(expr) // TODO subParser
		/* eslint-enable no-warning-comments */
	};
};

rules.variableAssignment = function (name, value) {
	return {type: 'variableAssignment', name: name, value: value};
};

rules.writableVariableName = function (text) {
	return text();
};

rules.bareword = function (cs, literal) {
	return literal(cs);
};

rules.glob = function (cs, text) {
	return {
		type: 'glob',
		value: text()
	};
};

rules.escapedMetaChar = function (character) {
	return character;
};

rules.concatenation = function (pieces, flattenConcatenation) {
	return flattenConcatenation(pieces);
};

rules.singleQuote = function (inner, literal) {
	return literal(inner);
};

rules.doubleQuote = function (contents, literal, flattenConcatenation) {
	var pieces = contents.map(function (it) {
		return isArray(it) ? literal(it) : it;
	});

	return flattenConcatenation(pieces);
};

rules.escapedQuote = function (character) {
	return character;
};

rules.parenCommandSubstitution = function (commands) {
	return {
		type: 'commandSubstitution',
		commands: commands
	};
};

rules.backQuote = function (input, parse) {
	return {
		type: 'commandSubstitution',
		commands: parse(input.join(''))
	};
};

rules.pipe = function (command) {
	return {type: 'pipe', command: command};
};

rules.moveFd = function (fd, op, dest) {
	if (fd === null) {
		fd = op[0] === '<' ? 0 : 1;
	}
	return {
		type: 'moveFd',
		fd: fd,
		op: op,
		dest: dest
	};
};

rules.duplicateFd = function (src, op, dest) {
	if (src === null) {
		src = op[0] === '<' ? 0 : 1;
	}
	return {
		type: 'duplicateFd',
		srcFd: src,
		op: op,
		destFd: dest
	};
};

rules.redirectFd = function (fd, op, filename) {
	if (fd === null) {
		fd = op[0] === '<' ? 0 : 1;
	}
	return {
		type: 'redirectFd',
		fd: fd,
		op: op,
		filename: filename
	};
};
