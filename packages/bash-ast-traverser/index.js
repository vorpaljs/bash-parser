'use strict';
/* eslint-disable camelcase */

/*
 *  Execute a method of visitor object that has the same name
 *  of AST node type.
 *
 *  The method receive as first argument the node, and
 *  subsequently the context array exploded
 */
function visit(node, context, visitor) {
	if (Array.isArray(visitor)) {
		return visitor.map(v => visit(node, context, v));
	}

	const method = visitor[node.type];
	if (typeof method === 'function') {
		return method(node, ...context);
	}
}

let traverseNode;

const DescendVisitor = {
	complete_command(node, parent, ast, visitor) {
		return node.commands.map(traverseNode(node, ast, visitor));
	},
	pipeline(node, parent, ast, visitor) {
		return node.commands.map(traverseNode(node, ast, visitor));
	}
};

traverseNode = (parent, ast, visitor) => node => {
	return visit(node, [parent, ast, visitor], [DescendVisitor, visitor]);
};

const traverse = (ast, visitor) => traverseNode(null, ast, visitor)(ast);

traverse.visit = visit;

module.exports = traverse;
