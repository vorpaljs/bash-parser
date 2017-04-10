'use strict';

const DescendVisitor = require('./descend-visitor')(traverseNode);

/*
 *  Execute a visitor object method that has the same name
 *  of an AST node type.
 *
 *  The visitor method receive as arguments the AST node,
 *  and the execution context.
 */
function visit(node, context, visitor) {
	if (node === null || node === undefined) {
		return null;
	}

	if (Array.isArray(visitor)) {
		return visitor
			.reduce((n, v) => {
				const newNode = visit(n, context, v);
				return newNode;
			}, node);
	}

	const method = visitor[node.type];
	if (typeof method === 'function') {
		return method.apply(null, [node].concat(context));
	}

	const defaultMethod = visitor.defaultMethod;
	if (typeof defaultMethod === 'function') {
		return defaultMethod.apply(null, [node].concat(context));
	}

	return node;
}

function traverseNode(parent, ast, visitor) {
	return node =>
		visit(
			node,
			[parent, ast, visitor],
			[DescendVisitor, visitor]
		);
}

const traverse = (ast, visitor) => {
	return traverseNode(null, ast, visitor)(ast);
};

traverse.visit = visit;

module.exports = traverse;
