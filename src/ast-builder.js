/* eslint-disable max-lines */
/* eslint-disable no-sequences */
/* eslint-disable no-return-assign */
/* eslint-disable camelcase */

module.exports = options => {
	const builder = {};
	mkListHelper(builder, 'caseList');
	mkListHelper(builder, 'pattern');
	mkListHelper(builder, 'prefix');
	mkListHelper(builder, 'suffix');

	builder.caseItem = (pattern, body, locStart, locEnd) => {
		const node = {
			type: 'case_item',
			pattern,
			body
		};

		if (options.insertLOC) {
			node.loc = setLocEnd(setLocStart({}, locStart), locEnd);
		}

		return node;
	};

	builder.caseClause = (clause, cases, locStart, locEnd) => {
		const node = {
			type: 'case',
			clause
		};

		if (cases) {
			Object.assign(node, {cases});
		}

		if (options.insertLOC) {
			node.loc = setLocEnd(setLocStart({}, locStart), locEnd);
		}

		return node;
	};

	builder.doGroup = (group, locStart, locEnd) => {
		if (options.insertLOC) {
			setLocEnd(setLocStart(group.loc, locStart), locEnd);
		}
		return group;
	};

	builder.braceGroup = (group, locStart, locEnd) => {
		if (options.insertLOC) {
			setLocEnd(setLocStart(group.loc, locStart), locEnd);
		}
		return group;
	};

	builder.list = and_or => {
		const node = {type: 'complete_command', commands: [and_or]};
		if (options.insertLOC) {
			node.loc = setLocEnd(setLocStart({}, and_or.loc), and_or.loc);
		}
		return node;
	};
	builder.listAppend = (list, and_or) => {
		list.commands.push(and_or);
		if (options.insertLOC) {
			setLocEnd(list.loc, and_or.loc);
		}
		return list;
	};

	builder.term = and_or => {
		const node = {
			type: 'compound_list',
			commands: [and_or]
		};
		if (options.insertLOC) {
			node.loc = setLocEnd(setLocStart({}, and_or.loc), and_or.loc);
		}
		return node;
	};

	builder.termAppend = (term, and_or) => {
		term.commands.push(and_or);
		setLocEnd(term.loc, and_or.loc);
		return term;
	};

	builder.subshell = list => ({type: 'subshell', list});

	builder.pipeSequence = command => {
		const node = {
			type: 'pipeline',
			commands: [command]
		};

		if (options.insertLOC) {
			node.loc = setLocEnd(setLocStart({}, command.loc), command.loc);
		}
		return node;
	};

	builder.pipeSequenceAppend = (pipe, command) => {
		pipe.commands.push(command);
		if (options.insertLOC) {
			setLocEnd(pipe.loc, command.loc);
		}
		return pipe;
	};

	builder.bangPipeLine = pipe => {
		const bang = true;
		if (pipe.commands.length === 1) {
			return Object.assign(pipe.commands[0], {bang});
		}
		return Object.assign(pipe, {bang});
	};

	builder.pipeLine = pipe => {
		if (pipe.commands.length === 1) {
			return pipe.commands[0];
		}
		return pipe;
	};

	builder.andAndOr = (left, right) => {
		const node = {
			type: 'and_or',
			op: 'and',
			left,
			right
		};

		if (options.insertLOC) {
			node.loc = setLocEnd(setLocStart({}, left.loc), right.loc);
		}

		return node;
	};

	builder.orAndOr = (left, right) => {
		const node = {
			type: 'and_or',
			op: 'or',
			left,
			right
		};

		if (options.insertLOC) {
			node.loc = setLocEnd(setLocStart({}, left.loc), right.loc);
		}

		return node;
	};

	builder.forClause = (name, wordlist, doGroup, locStart) => {
		const node = {
			type: 'for',
			name,
			wordlist: wordlist,
			do: doGroup
		};

		if (options.insertLOC) {
			node.loc = setLocEnd(setLocStart({}, locStart), doGroup.loc);
		}

		return node;
	};

	builder.forClauseDefault = (name, doGroup, locStart) => {
		const node = {
			type: 'for',
			name,
			do: doGroup
		};

		if (options.insertLOC) {
			node.loc = setLocEnd(setLocStart({}, locStart), doGroup.loc);
		}

		return node;
	};

	builder.functionDefinition = (name, body) => {
		const node = {
			type: 'function',
			name,
			body
		};

		if (options.insertLOC) {
			node.loc = setLocEnd(setLocStart({}, name.loc), body.loc);
		}

		return node;
	};

	builder.elseClause = (compoundList, locStart) => {
		if (options.insertLOC) {
			setLocStart(compoundList.loc, locStart.loc);
		}

		return compoundList;
	};

	// eslint-disable-next-line max-params
	builder.ifClause = (clause, then, elseBranch, locStart, locEnd) => {
		const node = {
			type: 'if',
			clause,
			then
		};

		if (elseBranch) {
			node.else = elseBranch;
		}

		if (options.insertLOC) {
			node.loc = setLocEnd(setLocStart({}, locStart), locEnd);
		}

		return node;
	};

	builder.elifClause = (clause, then, elseBranch) => {
		const node = {
			type: 'elif',
			clause,
			then
		};
		if (elseBranch) {
			node.else = elseBranch;
		}
		return node;
	};

	builder.while = (clause, body, whileWord) => {
		const node = {
			type: 'while',
			clause,
			do: body
		};

		if (options.insertLOC) {
			node.loc = setLocEnd(setLocStart({}, whileWord.loc), body.loc);
		}

		return node;
	};

	builder.until = (clause, body, whileWord) => {
		const node = {
			type: 'until',
			clause,
			do: body
		};

		if (options.insertLOC) {
			node.loc = setLocEnd(setLocStart({}, whileWord.loc), body.loc);
		}

		return node;
	};

	builder.commandName = name => name;

	builder.command = function command(prefix, command, suffix) {
		const node = {
			type: 'simple_command',
			name: command
		};

		if (options.insertLOC) {
			node.loc = {};
			if (prefix) {
				const firstPrefix = prefix[0];
				node.loc.startLine = firstPrefix.loc.startLine;
				node.loc.startColumn = firstPrefix.loc.startColumn;
			} else {
				node.loc.startLine = command.loc.startLine;
				node.loc.startColumn = command.loc.startColumn;
			}

			if (suffix) {
				const lastSuffix = suffix[suffix.length - 1];
				node.loc.endLine = lastSuffix.loc.endLine;
				node.loc.endColumn = lastSuffix.loc.endColumn;
			} else {
				node.loc.endLine = command.loc.endLine;
				node.loc.endColumn = command.loc.endColumn;
			}
		}

		if (prefix) {
			node.prefix = prefix;
		}
		if (suffix) {
			node.suffix = suffix;
		}
		return node;
	};

	builder.ioRedirect = (op, file) => {
		const node = {
			type: 'io_redirect',
			op: op,
			file: file
		};
		if (options.insertLOC) {
			node.loc = setLocEnd(setLocStart({}, op.loc), file.loc);
		}

		return node;
	};

	builder.numberIoRedirect = (ioRedirect, numberIo) => {
		const node = Object.assign({}, ioRedirect, {numberIo});
		if (options.insertLOC) {
			setLocStart(node.loc, numberIo.loc);
		}
		return node;
	};

	/*
	for (const methodName of Object.keys(builder)) {
		const method = builder[methodName];
		builder[methodName] = (...args) => {
			console.log(methodName);
			method(...args);
		};
	}
	*/

	return builder;
};

function setLocStart(target, source) {
	if (source) {
		target.startLine = source.startLine;
		target.startColumn = source.startColumn;
	}
	return target;
}

function setLocEnd(target, source) {
	if (source) {
		target.endLine = source.endLine;
		target.endColumn = source.endColumn;
	}
	return target;
}

function mkListHelper(builder, listName) {
	builder[listName] = item => {
		return [item];
	};
	builder[`${listName}Append`] = (list, item) => {
		list.push(item);
		return list;
	};
}
