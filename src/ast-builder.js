'use strict';

/* eslint-disable no-sequences */
/* eslint-disable no-return-assign */

exports.list = andOr => ({type: 'list', andOrs: [andOr]});	// eslint-disable-line camelcase
exports.listAppend = (list, andOr) => (list.andOrs.push(andOr), list);

exports.term = andOr => ({type: 'term', andOrs: [andOr]});	// eslint-disable-line camelcase
exports.termAppend = (term, andOr) => (term.andOrs.push(andOr), term);
exports.subshell = list => ({type: 'subshell', list});
exports.listAppend = (list, andOr) => (list.andOrs.push(andOr), list);

exports.pipeSequence = command => {
	return [command];
};
exports.pipeSequenceAppend = (pipe, command) => (pipe.push(command), pipe);
exports.bangPipeSequence = pipe => (pipe.bang = true, pipe);
exports.singleAndOr = pipe => {
	return {type: 'andOr', left: pipe};
};
exports.andAndOr = (left, right) => {
	return {
		type: 'andOr',
		op: 'and',
		left: left,
		right: exports.singleAndOr(right)
	};
};
exports.orAndOr = (left, right) => {
	return {
		type: 'andOr',
		op: 'or',
		left: left,
		right: exports.singleAndOr(right)
	};
};
exports.forClause = (name, wordlist, doGroup) => ({
	type: 'for',
	name: name.text,
	wordlist: wordlist.map(item => item.text || item),
	do: doGroup
});

exports.forClauseDefault = (name, doGroup) => ({
	type: 'for',
	name: name.text,
	do: doGroup
});

exports.functionDefinition = (name, body) => ({
	type: 'function',
	name: name.text,
	body
});

exports.ifClause = (clause, then, elseBranch) => {
	const node = {
		type: 'if',
		clause: clause,
		then: then
	};
	if (elseBranch) {
		node.else = elseBranch;
	}
	return node;
};

exports.elifClause = (clause, then, elseBranch) => {
	const node = {
		type: 'elif',
		clause: clause,
		then: then
	};
	if (elseBranch) {
		node.else = elseBranch;
	}
	return node;
};
exports.while = (clause, body) => ({type: 'while', clause, do: body});
exports.until = (clause, body) => ({type: 'until', clause, do: body});
exports.command = (prefix, command, suffix) => {
	const node = {
		type: 'simple_command',
		name: command
	};
	if (prefix) {
		node.prefix = prefix;
	}
	if (suffix) {
		node.suffix = suffix;
	}
	return node;
};
exports.ioRedirect = (op, file) => ({type: 'io_redirect', op: op.text, file: file.text});
exports.numberIoRedirect = (ioRedirect, numberIo) =>
	(ioRedirect.numberIo = numberIo.text, ioRedirect);

exports.suffix = item => {
	return {type: 'cmd_suffix', list: [item]};
};

exports.suffixAppend = (suffix, item) => {
	suffix.list.push(item);
	return suffix;
};

exports.prefix = item => ({type: 'cmd_prefix', list: [item]});
exports.prefixAppend = (prefix, item) => (prefix.list.push(item), prefix);
