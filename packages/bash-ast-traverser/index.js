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
			return node;
		}
		const traverse = traverseNode(node, ast, visitor);
		return Object.assign({}, node, {expansion: node.expansion.map(traverse)});
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
			return node;
		}
		const traverse = traverseNode(node, ast, visitor);
		return Object.assign({}, node, {expansion: node.expansion.map(traverse)});
	},

	ParameterExpansion(node, parent, ast, visitor) {
		if (!node.expansion) {
			return node;
		}
		const traverse = traverseNode(node, ast, visitor);
		return Object.assign({}, node, {expansion: node.expansion.map(traverse)});
	},

	Script(node, parent, ast, visitor) {
		if (!node.commands) {
			return node;
		}
		const traverse = traverseNode(node, ast, visitor);
		return Object.assign({}, node, {commands: node.commands.map(traverse)});
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
			return node;
		}
		const traverse = traverseNode(node, ast, visitor);
		return Object.assign({}, node, {body: traverse(node.body)});
	},

	Redirect(node, parent, ast, visitor) {
		if (!node.file) {
			return node;
		}
		const traverse = traverseNode(node, ast, visitor);
		return Object.assign({}, node, {file: traverse(node.file)});
	},

	LogicalExpression(node, parent, ast, visitor) {
		const traverse = traverseNode(node, ast, visitor);
		if (!node.left && !node.right) {
			return node;
		}

		return Object.assign({}, node, {
			left: node.left ? traverse(node.left) : node.left,
			right: node.right ? traverse(node.right) : node.right
		});
	},

	Case(node, parent, ast, visitor) {
		const traverse = traverseNode(node, ast, visitor);
		if (!node.cases && !node.clause) {
			return node;
		}

		return Object.assign({}, node, {
			cases: node.cases ? node.cases.map(traverse) : [],
			clause: node.clause ? traverse(node.clause) : null
		});
	},

	CaseItem(node, parent, ast, visitor) {
		if (!node.pattern && !node.body) {
			return node;
		}

		const traverse = traverseNode(node, ast, visitor);
		return Object.assign({}, node, {
			pattern: node.pattern ? node.pattern.map(traverse) : [],
			body: node.body ? traverse(node.body) : null
		});
	},

	If(node, parent, ast, visitor) {
		if (!node.clause && !node.then && !node.else) {
			return node;
		}

		const traverse = traverseNode(node, ast, visitor);
		return Object.assign({}, node, {
			clause: node.clause ? traverse(node.clause) : null,
			then: node.then ? traverse(node.then) : null,
			else: node.else ? traverse(node.else) : null
		});
	},

	While(node, parent, ast, visitor) {
		if (!node.clause && !node.do) {
			return node;
		}

		const traverse = traverseNode(node, ast, visitor);
		return Object.assign({}, node, {
			clause: node.clause ? traverse(node.clause) : null,
			do: node.do ? traverse(node.do) : null
		});
	},

	Until(node, parent, ast, visitor) {
		if (!node.clause && !node.do) {
			return node;
		}

		const traverse = traverseNode(node, ast, visitor);
		return Object.assign({}, node, {
			clause: node.clause ? traverse(node.clause) : null,
			do: node.do ? traverse(node.do) : null
		});
	},

	Name(node) {
		return node;
	},

	Command(node, parent, ast, visitor) {
		if (!node.name && !node.prefix && !node.suffix) {
			return node;
		}

		const traverse = traverseNode(node, ast, visitor);
		return Object.assign({}, node, {
			name: node.name ? traverse(node.name) : null,
			prefix: node.prefix ? node.prefix.map(traverse) : [],
			suffix: node.suffix ? node.suffix.map(traverse) : []
		});
	},

	For(node, parent, ast, visitor) {
		if (!node.do && !node.wordlist) {
			return node;
		}

		const traverse = traverseNode(node, ast, visitor);
		return Object.assign({}, node, {
			do: node.do ? traverse(node.do) : null,
			wordlist: node.wordlist ? node.wordlist.map(traverse) : []
		});
	},

	Pipeline(node, parent, ast, visitor) {
		if (!node.commands) {
			return node;
		}
		const traverse = traverseNode(node, ast, visitor);
		return Object.assign({}, node, {
			commands: node.commands ? node.commands.map(traverse) : []
		});
	},

	Subshell(node, parent, ast, visitor) {
		if (!node.list) {
			return node;
		}
		const traverse = traverseNode(node, ast, visitor);
		return Object.assign({}, node, {
			list: node.list ? node.list.map(traverse) : []
		});
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
