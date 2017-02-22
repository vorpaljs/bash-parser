'use strict';
/* eslint-disable camelcase */

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
}

let traverseNode;

const DescendVisitor = {

	AssignmentWord(node, parent, ast, visitor) {
		if (!node.expansion) {
			return null;
		}
		const traverse = traverseNode(node, ast, visitor);
		return node.expansion.map(traverse);
	},

	ArithmeticExpansion(node, parent, ast, visitor) {
		if (!node.expansion) {
			return node;
		}
		const traverse = traverseNode(node, ast, visitor);
		return Object.assign({}, node, {expansion: node.expansion.map(traverse)});
	},

	CommandExpansion(node, parent, ast, visitor) {
		if (!node.expansion) {
			return null;
		}
		const traverse = traverseNode(node, ast, visitor);
		return node.expansion.map(traverse);
	},

	ParameterExpansion(node, parent, ast, visitor) {
		if (!node.expansion) {
			return null;
		}
		const traverse = traverseNode(node, ast, visitor);
		return node.expansion.map(traverse);
	},

	Script(node, parent, ast, visitor) {
		if (!node.commands) {
			return null;
		}
		const traverse = traverseNode(node, ast, visitor);
		return node.commands.map(traverse);
	},

	Word(node, parent, ast, visitor) {
		if (!node.expansion) {
			return node;
		}
		const traverse = traverseNode(node, ast, visitor);
		return Object.assign({}, node, {expansion: node.expansion.map(traverse)});
	},

	Function(node, parent, ast, visitor) {
		if (!node.body) {
			return null;
		}
		const traverse = traverseNode(node, ast, visitor);
		return traverse(node.body);
	},

	Redirect(node, parent, ast, visitor) {
		if (!node.file) {
			return node;
		}
		const traverse = traverseNode(node, ast, visitor);
		const result = Object.assign({}, node, {file: traverse(node.file)});
		return result;
	},

	LogicalExpression(node, parent, ast, visitor) {
		const traverse = traverseNode(node, ast, visitor);
		return [
			node.left ? traverse(node.left) : null,
			node.right ? traverse(node.right) : null
		];
	},

	Case(node, parent, ast, visitor) {
		const traverse = traverseNode(node, ast, visitor);
		return (node.cases ? node.cases.map(traverse) : [])
			.concat(
				node.clause ? traverse(node.clause) : null
			);
	},

	CaseItem(node, parent, ast, visitor) {
		const traverse = traverseNode(node, ast, visitor);
		return (node.pattern ? node.pattern.map(traverse) : [])
			.concat(
				traverse(node.body)
			);
	},

	If(node, parent, ast, visitor) {
		const traverse = traverseNode(node, ast, visitor);
		return [
			traverse(node.clause),
			traverse(node.then),
			traverse(node.else)
		];
	},

	While(node, parent, ast, visitor) {
		const traverse = traverseNode(node, ast, visitor);
		return [
			traverse(node.clause),
			traverse(node.do)
		];
	},

	Until(node, parent, ast, visitor) {
		const traverse = traverseNode(node, ast, visitor);
		return [
			traverse(node.clause),
			traverse(node.do)
		];
	},

	Name(node, parent, ast, visitor) {
		return node;
	},

	Command(node, parent, ast, visitor) {
		const traverse = traverseNode(node, ast, visitor);
		return [
			traverse(node.name),
			node.prefix ? node.prefix.map(traverse) : [],
			node.suffix ? node.suffix.map(traverse) : []
		];
	},

	For(node, parent, ast, visitor) {
		const traverse = traverseNode(node, ast, visitor);
		return [
			node.wordlist ? node.wordlist.map(traverse) : [],
			traverse(node.do)
		];
	},

	Pipeline(node, parent, ast, visitor) {
		if (!node.commands) {
			return null;
		}
		const traverse = traverseNode(node, ast, visitor);
		return node.commands.map(traverse);
	},

	Subshell(node, parent, ast, visitor) {
		if (!node.list) {
			return null;
		}
		const traverse = traverseNode(node, ast, visitor);
		return traverse(node.list);
	}
};

traverseNode = (parent, ast, visitor) => node =>
	visit(
		node,
		[parent, ast, visitor],
		[DescendVisitor, visitor]
	)
;

const traverse = (ast, visitor) =>
	traverseNode(null, ast, visitor)(ast);

traverse.visit = visit;

module.exports = traverse;
