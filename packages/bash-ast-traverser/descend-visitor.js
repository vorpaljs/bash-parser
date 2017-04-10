'use strict';

const list = {};
const single = {};

module.exports = traverseNode => {
	const descendProperties = properties => (node, parent, ast, visitor) => {
		const propertiesNames = Object.keys(properties);

		if (propertiesNames.every(name => !node[name])) {
			return node;
		}

		const traverse = traverseNode(node, ast, visitor);
		const traversedProperties = propertiesNames.map(name => {
			try {
				const kind = properties[name];
				const value = kind === list ?
					((node[name] && node[name].map(traverse)) || []) :
					traverse(node[name]);
				return {[name]: value};
			} catch (err) {
				throw new Error(
					`While traversing property ${name}:${err.message}`
				);
			}
		});

		return Object.assign.apply(null, [{}, node].concat(traversedProperties));
	};

	return {
		defaultMethod(node) {
			return node;
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
};
