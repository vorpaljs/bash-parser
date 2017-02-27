'use strict';

const list = {};
const single = {};

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

function astVisit(ast, context, visitors) {
	const descendProperties = properties => previousNode => {
		const node = visit(previousNode, context, visitors);

		const traverse = node => astVisit(node, context, visitors);

		const traversedProperties = Object.keys(properties).map(name => {
			if (!node[name]) {
				return null;
			}

			const kind = properties[name];
			if (kind === list) {
				return {
					[name]: node[name].map(traverse)
				};
			}

			return {
				[name]: traverse(node[name])
			};
		});

		return Object.assign({}, node, ...traversedProperties);
	};

	const DescendVisitor = {
		defaultMethod(node) {
			return visit(node, context, visitors);
		},

		AssignmentWord: descendProperties({expansion: list}),

		Script: descendProperties({commands: list}),

		CompoundList: descendProperties({commands: list}),

		Word: descendProperties({expansion: list}),

		Function: descendProperties({
			body: single,
			redirections: list
		}),

		Redirect: descendProperties({file: single}),

		LogicalExpression: descendProperties({
			left: single,
			right: single
		}),

		Case: descendProperties({
			cases: list,
			clause: single
		}),

		CaseItem: descendProperties({
			pattern: list,
			body: single
		}),

		If: descendProperties({
			clause: single,
			else: single,
			then: single
		}),

		While: descendProperties({
			clause: single,
			do: single
		}),

		Until: descendProperties({
			clause: single,
			do: single
		}),

		Command: descendProperties({
			name: single,
			prefix: list,
			suffix: list
		}),

		For: descendProperties({
			wordlist: list,
			do: single
		}),

		Pipeline: descendProperties({
			commands: list
		}),

		Subshell: descendProperties({
			list: single
		})
	};

	return visit(ast, context, [DescendVisitor]);
}

module.exports = astVisit;
