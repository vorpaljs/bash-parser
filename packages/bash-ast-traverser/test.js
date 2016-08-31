/* eslint-disable camelcase */
import test from 'ava';
import traverse from '.';

const _node = {
	type: 'NodeType'
};

const context = [42, 43];
const AstTypes = [
	'complete_command',
	'pipeline',
	'and_or',
	'word',
	'name',
	'compound_list',
	'subshell',
	'case',
	'case_item',
	'if',
	'simple_command',
	'function',
	'until',
	'arithmetic_expansion',
	'command_expansion',
	'parameter_expansion',
	'assignment_word',
	'while',
	'io_redirect'
];

const visitor = arg => ({
	NodeType(node, first, second) {
		return [node, first, second, arg];
	}
});

const TestVisitor = {};

function mkTestVisitor(name) {
	return [
		`traverse descend into node of type ${name}`,
		t => {
			const f = require(`${__dirname}/fixtures/${name.replace(/_/g, '-')}`);

			const results = traverse(f.ast, TestVisitor);
			t.is(JSON.stringify(results), JSON.stringify(f.expected));
		}
	];
}

for (const astNodeType of AstTypes) {
	TestVisitor[astNodeType] = node => {
		return `${astNodeType} on ${node.text}`;
	};
	test(...mkTestVisitor(astNodeType));
}

test('visit function work as expected', t => {
	const [node, first, second, other] = traverse.visit(_node, context, visitor(44));
	t.is(node, _node);
	t.is(first, 42);
	t.is(second, 43);
	t.is(other, 44);
});

test('visit function work with array visitors', t => {
	const [
		[node, first, second, other],
		[node2, first2, second2, other2]
	] = traverse.visit(_node, context, [visitor(44), visitor(45)]);

	t.is(node, _node);
	t.is(first, 42);
	t.is(second, 43);
	t.is(other, 44);

	t.is(node2, _node);
	t.is(first2, 42);
	t.is(second2, 43);
	t.is(other2, 45);
});

test('visit function return undefined if method not defined', t => {
	const result = traverse.visit({type: 'NodeType'}, [], {});
	t.is(result, undefined);
});
