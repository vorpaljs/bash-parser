const test = require('ava');
const traverse = require('.');

const _node = {
	type: 'NodeType'
};

const context = [42, 43];
const AstTypes = [
	'Subshell',
	'Pipeline',
	'For',
	'Command',
	'Until',
	'While',
	'If',
	'CaseItem',
	'Case',
	'LogicalExpression',
	'Function',
	'Script',
	'CommandExpansion',
	'ParameterExpansion',
	'ArithmeticExpansion',
	'AssignmentWord',
	'Name',
	'Word',
	'CompoundList',
	'Redirect'
];

const visitor = arg => ({
	NodeType(node, first, second) {
		return Object.assign({}, node, {
			args: (node.args || []).concat(first, second, arg)
		});
	}
});

const TestVisitor = {};

function mkTestVisitor(name) {
	return [
		`traverse descend into node of type ${name}`,
		t => {
			const f = require(`${__dirname}/fixtures/${name.replace(/_/g, '-')}`);

			const results = traverse(f.ast, TestVisitor);
			/* if (JSON.stringify(results) !== JSON.stringify(f.expected)) {
				console.log(JSON.stringify(results, null, 4))
			}*/

			t.deepEqual(
				results,
				f.expected
			);
		}
	];
}

for (const astNodeType of AstTypes) {
	TestVisitor[astNodeType] = node => {
		return Object.assign({visited: true}, node);
	};
	test(...mkTestVisitor(astNodeType));
}

test('visit Function work as expected', t => {
	const node = traverse.visit(_node, context, visitor(44));
	t.deepEqual(node, {
		type: 'NodeType',
		args: [42, 43, 44]
	});
});

test('visit Function work with array visitors', t => {
	const node = traverse.visit(_node, context, [visitor(44), visitor(45)]);
	t.deepEqual(node, {
		type: 'NodeType',
		args: [42, 43, 44, 42, 43, 45]
	});
});

test('visit Function return source node if method not defined', t => {
	const result = traverse.visit({type: 'NodeType'}, [], {});
	t.deepEqual(result, {type: 'NodeType'});
});

test('visit null nodes resolve to null', t => {
	const node = traverse.visit(null, context);
	t.is(null, node);
});
