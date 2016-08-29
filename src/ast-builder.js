'use strict';

/* eslint-disable no-sequences */
/* eslint-disable no-return-assign */
/* eslint-disable camelcase */

module.exports = options => {
	const builder = {};

	builder.list = andOr => ({type: 'list', andOrs: [andOr]});
	builder.listAppend = (list, andOr) => (list.andOrs.push(andOr), list);

	builder.term = andOr => {
		const node = {
			type: 'term',
			andOrs: [andOr]
		};
		if (options.insertLOC) {
			node.loc = setLocEnd(setLocStart({}, andOr.loc), andOr.loc);
		}
		return node;
	};

	builder.termAppend = (term, andOr) => {
		term.andOrs.push(andOr);
		setLocEnd(term.loc, andOr.loc);
		return term;
	};

	builder.subshell = list => ({type: 'subshell', list});
	builder.listAppend = (list, andOr) => (list.andOrs.push(andOr), list);

	builder.pipeSequence = command => {
		return [command];
	};
	builder.pipeSequenceAppend = (pipe, command) => (pipe.push(command), pipe);
	builder.bangPipeSequence = pipe => (pipe.bang = true, pipe);

	builder.singleAndOr = pipe => {
		const node = {
			type: 'andOr', left: pipe
		};
		if (options.insertLOC) {
			node.loc = setLocEnd(setLocStart({}, pipe[0].loc), pipe[pipe.length - 1].loc);
		}
		return node;
	};

	builder.andAndOr = (left, right) => {
		const node = {
			type: 'andOr',
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
			type: 'andOr',
			op: 'or',
			left,
			right: builder.singleAndOr(right)
		};

		if (options.insertLOC) {
			node.loc = setLocEnd(setLocStart({}, left.loc), right[right.length - 1].loc);
		}

		return node;
	};

	builder.forClause = (name, wordlist, doGroup) => ({
		type: 'for',
		name,
		wordlist: wordlist,
		do: doGroup
	});

	builder.forClauseDefault = (name, doGroup) => ({
		type: 'for',
		name,
		do: doGroup
	});

	builder.functionDefinition = (name, body) => ({
		type: 'function',
		name,
		body
	});

	builder.ifClause = (clause, then, elseBranch) => {
		const node = {
			type: 'if',
			clause,
			then
		};
		if (elseBranch) {
			node.else = elseBranch;
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

	builder.until = (clause, body) => ({type: 'until', clause, do: body});

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

	builder.filename = name => {
		return name;
	};

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
