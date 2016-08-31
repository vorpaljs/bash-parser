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
		return visitor
			.map(v => visit(node, context, v))
			.filter(v => v !== null && v !== undefined);
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

	word(node, parent, ast, visitor) {
		if (!node.expansion) {
			return null;
		}
		return node.expansion.map(traverseNode(node, ast, visitor));
	},

	and_or(node, parent, ast, visitor) {
		const traverse = traverseNode(node, ast, visitor);
		return [
			traverse(node.left),
			traverse(node.right)
		];
	},

	simple_command(node, parent, ast, visitor) {
		const traverse = traverseNode(node, ast, visitor);
		return [
			traverse(node.prefix),
			traverse(node.suffix)
		];
	},

	pipeline(node, parent, ast, visitor) {
		return node.commands.map(traverseNode(node, ast, visitor));
	}
};

traverseNode = (parent, ast, visitor) => node => {
	// console.log('traverseNode', node);
	const ret = visit(node, [parent, ast, visitor], [DescendVisitor, visitor]);
	// console.log('\tresults: ', ret);
	return ret;
};

const traverse = (ast, visitor) => traverseNode(null, ast, visitor)(ast);

traverse.visit = visit;

module.exports = traverse;
