/* eslint-disable max-lines */
/* eslint-disable no-sequences */
/* eslint-disable no-return-assign */
/* eslint-disable camelcase */

module.exports = options => {
	const builder = {};
	mkListHelper(builder, 'caseList');
	mkListHelper(builder, 'pattern');

	builder.caseItem = (pattern, body, locStart, locEnd) => {
		const node = {
			type: 'pattern',
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
		const node = {type: 'list', and_ors: [and_or]};
		if (options.insertLOC) {
			node.loc = setLocEnd(setLocStart({}, and_or.loc), and_or.loc);
		}
		return node;
	};
	builder.listAppend = (list, and_or) => {
		list.and_ors.push(and_or);
		if (options.insertLOC) {
			setLocEnd(list.loc, and_or.loc);
		}
		return list;
	};

	builder.term = and_or => {
		const node = {
			type: 'term',
			and_ors: [and_or]
		};
		if (options.insertLOC) {
			node.loc = setLocEnd(setLocStart({}, and_or.loc), and_or.loc);
		}
		return node;
	};

	builder.termAppend = (term, and_or) => {
		term.and_ors.push(and_or);
		setLocEnd(term.loc, and_or.loc);
		return term;
	};

	builder.subshell = list => ({type: 'subshell', list});

	builder.pipeSequence = command => {
		return [command];
	};
	builder.pipeSequenceAppend = (pipe, command) => (pipe.push(command), pipe);
	builder.bangPipeSequence = pipe => (pipe.bang = true, pipe);

	builder.singleAndOr = pipe => {
		const node = {
			type: 'and_or', left: pipe
		};
		if (options.insertLOC) {
			node.loc = setLocEnd(setLocStart({}, pipe[0].loc), pipe[pipe.length - 1].loc);
		}
		return node;
	};

	builder.andAndOr = (left, right) => {
		const node = {
			type: 'and_or',
			op: 'and',
			left,
			right: builder.singleAndOr(right)
		};

		if (options.insertLOC) {
			node.loc = setLocEnd(setLocStart({}, left.loc), right[right.length - 1].loc);
		}

		return node;
	};

	builder.orAndOr = (left, right) => {
		const node = {
			type: 'and_or',
			op: 'or',
			left,
			right: builder.singleAndOr(right)
		};

		if (options.insertLOC) {
			node.loc = setLocEnd(setLocStart({}, left.loc), right[right.length - 1].loc);
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
				const firstPrefix = prefix.list[0];
				node.loc.startLine = firstPrefix.loc.startLine;
				node.loc.startColumn = firstPrefix.loc.startColumn;
			} else {
				node.loc.startLine = command.loc.startLine;
				node.loc.startColumn = command.loc.startColumn;
			}

			if (suffix) {
				const lastSuffix = suffix.list[suffix.list.length - 1];
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

	builder.suffix = item => {
		const node = {
			type: 'cmd_suffix',
			list: [item]
		};
		return node;
	};

	builder.suffixAppend = (suffix, item) => {
		suffix.list.push(item);
		return suffix;
	};

	builder.prefix = item => ({type: 'cmd_prefix', list: [item]});
	builder.prefixAppend = (prefix, item) => (prefix.list.push(item), prefix);
	builder.filename = name => name;

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
