'use strict';

/* eslint-disable no-sequences */
/* eslint-disable no-return-assign */

exports.list = andOr => ({type: 'list', andOrs: [andOr]});	// eslint-disable-line camelcase
exports.listAppend = (list, andOr) => (list.andOrs.push(andOr), list);

exports.term = andOr => ({type: 'term', andOrs: [andOr]});	// eslint-disable-line camelcase
exports.termAppend = (term, andOr) => (term.andOrs.push(andOr), term);
exports.subshell = list => ({type: 'subshell', list});
exports.listAppend = (list, andOr) => (list.andOrs.push(andOr), list);

exports.pipeSequence = command => ([command]);
exports.pipeSequenceAppend = (pipe, command) => (pipe.push(command), pipe);
exports.bangPipeSequence = pipe => (pipe.bang = true, pipe);
exports.singleAndOr = pipe => ({type: 'andOr', left: pipe});
exports.andAndOr = (left, right) => ({
	type: 'andOr',
	op: 'and',
	left: left,
	right: exports.singleAndOr(right)
});
exports.orAndOr = (left, right) => ({
	type: 'andOr',
	op: 'or',
	left: left,
	right: exports.singleAndOr(right)
});
exports.forClause = (name, wordlist, doGroup) => ({
	type: 'for',
	name: name,
	wordlist: wordlist,
	do: doGroup
});

exports.forClauseDefault = (name, doGroup) => ({
	type: 'for',
	name: name,
	do: doGroup
});

exports.functionDefinition = (name, body) => ({
	type: 'function',
	name,
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
	// console.log(JSON.stringify(node,null,2))
	return node;
};
exports.ioRedirect = (op, file) => ({type: 'io_redirect', op, file});
exports.numberIoRedirect = (ioRedirect, numberIo) =>
	(ioRedirect.numberIo = numberIo, ioRedirect);

exports.suffix = item => {
	let enhancedItem;
	if (item.type === 'io_redirect') {
		enhancedItem = item;
	} else if (typeof item === 'object') {
		enhancedItem = {
			type: 'cmd_argument',
			value: item.text,
			expansion: item.expansion
		};
	} else {
		enhancedItem = {
			type: 'cmd_argument',
			value: item
		};
	}
	return {type: 'cmd_suffix', list: [enhancedItem]};
};

exports.suffixAppend = (suffix, item) => {
	let enhancedItem;
	if (item.type === 'io_redirect') {
		enhancedItem = item;
	} else if (typeof item === 'object') {
		enhancedItem = {
			type: 'cmd_argument',
			value: item.text,
			expansion: item.expansion
		};
	} else {
		enhancedItem = {
			type: 'cmd_argument',
			value: item
		};
	}
	suffix.list.push(enhancedItem);
	return suffix;
};

exports.prefix = item => ({type: 'cmd_prefix', list: [item]});
exports.prefixAppend = (prefix, item) => (prefix.list.push(item), prefix);
