# AST

Each AST node has a `type` property that define the type of the node.


# complete_command

> `complete_command` is the root node of the AST.

```js
{
	type: 'complete_command',
	commands: Array<and_or |
					pipeline |
					simple_command |
					function_definition |
					brace_group |
					subshell |
					for_clause |
					case_clause |
					if_clause |
					while_clause |
					until_clause>
}
```

# pipeline

> `pipeline` represent a list of commands concatenated with pipes.

> Commands are executed in parallel and the output of each one become the input of the subsequent.

```js
{
	type: 'pipeline',
	commands: Array<simple_command |
					function_definition |
					brace_group |
					subshell |
					for_clause |
					case_clause |
					if_clause |
					while_clause |
					until_clause>
}
```

# and_or

> Represent two commands (left and right) concateneted in a `and` (&&) or `or` (||)operation.

> In the `and` case, the right command is executed only if the left one is executed successfully. In the `or` case, the right command is executed only if the left one fails.

```js
{
	type: 'and_or',
	op: string,
	left: and_or |
		  pipeline |
		  simple_command |
		  function_definition |
		  brace_group |
		  subshell |
		  for_clause |
		  case_clause |
		  if_clause |
		  while_clause |
		  until_clause,
	right: and_or |
		   pipeline |
		   simple_command |
		   function_definition |
		   brace_group |
		   subshell |
		   for_clause |
		   case_clause |
		   if_clause |
		   while_clause |
		   until_clause
}
```

# simple_command

# function_definition

# brace_group

# subshell

# for_clause

# case_clause

# if_clause

# while_clause

# until_clause
