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
	if (node === null || node === undefined) {
		return null;
	}

	if (Array.isArray(visitor)) {
		return visitor
			.map(v => visit(node, context, v))
			.filter(v => v !== null && v !== undefined);
	}

	const method = visitor[node.type];
	if (typeof method === 'function') {
		return method(node, ...context);
	}

	const defaultMethod = visitor.defaultMethod;
	if (typeof defaultMethod === 'function') {
		return defaultMethod(node, ...context);
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
			return null;
		}
		const traverse = traverseNode(node, ast, visitor);
		return node.expansion.map(traverse);
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
			return null;
		}
		const traverse = traverseNode(node, ast, visitor);
		return node.expansion.map(traverse);
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
			return null;
		}
		const traverse = traverseNode(node, ast, visitor);
		return traverse(node.file);
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

	Command(node, parent, ast, visitor) {
		const traverse = traverseNode(node, ast, visitor);
		return [
			traverse(node.prefix),
			traverse(node.suffix)
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

traverseNode = (parent, ast, visitor) => node => {
	const ret = visit(node, [parent, ast, visitor], [DescendVisitor, visitor]);
	return ret;
};

const traverse = (ast, visitor) => traverseNode(null, ast, visitor)(ast);

traverse.visit = visit;

module.exports = traverse;
