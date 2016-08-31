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
}

let traverseNode;

const DescendVisitor = {

	assignment_word(node, parent, ast, visitor) {
		if (!node.expansion) {
			return null;
		}
		const traverse = traverseNode(node, ast, visitor);
		return node.expansion.map(traverse);
	},

	arithmetic_expansion(node, parent, ast, visitor) {
		if (!node.expansion) {
			return null;
		}
		const traverse = traverseNode(node, ast, visitor);
		return node.expansion.map(traverse);
	},

	command_expansion(node, parent, ast, visitor) {
		if (!node.expansion) {
			return null;
		}
		const traverse = traverseNode(node, ast, visitor);
		return node.expansion.map(traverse);
	},

	parameter_expansion(node, parent, ast, visitor) {
		if (!node.expansion) {
			return null;
		}
		const traverse = traverseNode(node, ast, visitor);
		return node.expansion.map(traverse);
	},

	complete_command(node, parent, ast, visitor) {
		if (!node.commands) {
			return null;
		}
		const traverse = traverseNode(node, ast, visitor);
		return node.commands.map(traverse);
	},

	word(node, parent, ast, visitor) {
		if (!node.expansion) {
			return null;
		}
		const traverse = traverseNode(node, ast, visitor);
		return node.expansion.map(traverse);
	},

	function(node, parent, ast, visitor) {
		if (!node.body) {
			return null;
		}
		const traverse = traverseNode(node, ast, visitor);
		return node.body.map(traverse);
	},

	io_redirect(node, parent, ast, visitor) {
		if (!node.file) {
			return null;
		}
		const traverse = traverseNode(node, ast, visitor);
		return traverse(node.file);
	},

	and_or(node, parent, ast, visitor) {
		const traverse = traverseNode(node, ast, visitor);
		return [
			node.left ? traverse(node.left) : null,
			node.right ? traverse(node.right) : null
		];
	},

	case(node, parent, ast, visitor) {
		const traverse = traverseNode(node, ast, visitor);
		return (node.cases ? node.cases.map(traverse) : [])
			.concat(
				node.clause ? traverse(node.clause) : null
			);
	},

	case_item(node, parent, ast, visitor) {
		const traverse = traverseNode(node, ast, visitor);
		return (node.pattern ? node.pattern.map(traverse) : [])
			.concat(
				node.body ? node.body.map(traverse) : null
			);
	},

	if(node, parent, ast, visitor) {
		const traverse = traverseNode(node, ast, visitor);
		return (node.clause ? node.clause.map(traverse) : [])
			.concat(
				node.then ? node.then.map(traverse) : null
			)
			.concat(
				node.else ? node.else.map(traverse) : null
			);
	},

	while(node, parent, ast, visitor) {
		const traverse = traverseNode(node, ast, visitor);
		return (node.clause ? node.clause.map(traverse) : [])
			.concat(
				node.do ? node.do.map(traverse) : null
			);
	},

	until(node, parent, ast, visitor) {
		const traverse = traverseNode(node, ast, visitor);
		return (node.clause ? node.clause.map(traverse) : [])
			.concat(
				node.do ? node.do.map(traverse) : null
			);
	},

	simple_command(node, parent, ast, visitor) {
		const traverse = traverseNode(node, ast, visitor);
		return [
			node.prefix ? traverse(node.prefix) : null,
			node.suffix ? traverse(node.suffix) : null
		];
	},

	pipeline(node, parent, ast, visitor) {
		if (!node.commands) {
			return null;
		}
		return node.commands.map(traverseNode(node, ast, visitor));
	},

	compound_list(node, parent, ast, visitor) {
		if (!node.commands) {
			return null;
		}
		return node.commands.map(traverseNode(node, ast, visitor));
	},

	subshell(node, parent, ast, visitor) {
		if (!node.list) {
			return null;
		}
		return node.list.map(traverseNode(node, ast, visitor));
	}
};

traverseNode = (parent, ast, visitor) => node => {
	const ret = visit(node, [parent, ast, visitor], [DescendVisitor, visitor]);
	return ret;
};

const traverse = (ast, visitor) => traverseNode(null, ast, visitor)(ast);

traverse.visit = visit;

module.exports = traverse;
