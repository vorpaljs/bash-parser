/* eslint-disable camelcase */
import test from 'ava';
import traverse from '.';

const _node = {
	type: 'NodeType'
};
const context = [42, 43];
const visitor = arg => ({
	NodeType(node, first, second) {
		return [node, first, second, arg];
	}
});

const ast = {
	type: 'complete_command',
	text: 0,
	commands: [{
		type: 'simple_command',
		text: 1
	}, {
		type: 'simple_command',
		text: 2
	}]
};

const visitor2 = {
	complete_command(node) {
		return 'complete_command on ' + node.text;
	},

	simple_command(node) {
		return 'simple_command on ' + node.text;
	}
};

test('traverse descend into children nodes', t => {
	const results = traverse(ast, visitor2);
	const expected = [
		[
			[
				null,
				'simple_command on 1'
			],
			[
				null,
				'simple_command on 2'
			]
		],
		'complete_command on 0'
	];

	t.is(JSON.stringify(results), JSON.stringify(expected));
});

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
