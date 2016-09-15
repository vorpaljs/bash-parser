# bash-ast-traverser

> Traverse an AST object created by bash-parser

# Usage

```js
const traverse = require('bash-ast-traverser');
traverse(ast, {
	simple_command(node) {
		if (node.name.text !== '') {
			const expectAliasCheck =
				node.name.maybeSimpleCommandName ||
				node.name.text.indexOf('$') !== -1 ||
				node.name.text[0].match(/[0-9]/);

			assert.ok(expectAliasCheck, `expected simple_command name ${JSON.stringify(node, null, 2)}`);
		}
		delete node.name.maybeSimpleCommandName;
	},

	defaultMethod(node) {
		assert.ok(!node.maybeSimpleCommandName, `simple_command name not expected ${JSON.stringify(node, null, 2)}`);
		delete node.maybeSimpleCommandName;
	}
});
```
