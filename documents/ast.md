# AST

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Introduction](#introduction)
- [complete_command](#complete_command)
- [pipeline](#pipeline)
- [and_or](#and_or)
- [simple_command](#simple_command)
- [function](#function)
- [name](#name)
- [compound_list](#compound_list)
- [subshell](#subshell)
- [case](#case)
- [case_item](#case_item)
- [if](#if)
- [while](#while)
- [until](#until)
- [word](#word)
- [assignment_word](#assignment_word)
- [arithmetic_expansion](#arithmetic_expansion)
- [command_expansion](#command_expansion)
- [parameter_expansion](#parameter_expansion)
- [io_redirect](#io_redirect)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Introduction

Each AST node has a `type` property that define the type of the node.

If the source is parsed specifing the `insertLOC` option, each node contins a `loc` property that contains the starting and ending lines and columns of the node:

```js
{
	endLine: Number,
	endColumn: Number
}
```


# complete_command

> `complete_command` is the root node of the AST.


```js
{
	type: 'complete_command',
	commands: Array<and_or |
					pipeline |
					simple_command |
					function |
					subshell |
					for |
					case |
					if_clause |
					while_clause |
					until_clause>
}
```

# pipeline

> `pipeline` represents a list of commands concatenated with pipes.

> Commands are executed in parallel and the output of each one become the input of the subsequent.

```js
{
	type: 'pipeline',
	commands: Array<simple_command |
					function |
					brace_group |
					subshell |
					for |
					case |
					if_clause |
					while_clause |
					until_clause>
}
```

# and_or

> Represents two commands (left and right) concateneted in a `and` (&&) or `or` (||) operation.

> In the `and` case, the right command is executed only if the left one is executed successfully. In the `or` case, the right command is executed only if the left one fails.

```js
{
	type: 'and_or',
	op: string,
	left: and_or |
		  pipeline |
		  simple_command |
		  function |
		  brace_group |
		  subshell |
		  for |
		  case |
		  if_clause |
		  while_clause |
		  until_clause,
	right: and_or |
		   pipeline |
		   simple_command |
		   function |
		   brace_group |
		   subshell |
		   for |
		   case |
		   if_clause |
		   while_clause |
		   until_clause
}
```

# simple_command

> Represents a builtin or external command to execute. It could optionally have a list of arguments, stream redirection operation and environment variable assignments.

```js
{
	type: 'simple_command',
	name: word,
	prefix: Array<assignment_word | io_redirect>,
	suffix: Array<word | io_redirect>
}
```

# function

> `function` represents the definition of a function.

> It is formed by the name of the function  itself and a list of all command that forms the body of the function.

```js
{
	type: 'function',
	name: name,
	body: compound_list
}
```

# name

> Represents the name of a function or a `for` variable.

> Valid name values should be formed by one or more alphanumeric characters or underscores, and the could not start with a digit.

```js
{
	type: 'name',
	text: String
}
```

# compound_list

> `compound_list` represent a group of commands that form the body of `for`, `until` `while`, `if`, `else`, `case` items and `function` command.

```js
{
	type: 'compound_list',
	commands: Array<and_or |
					pipeline |
					simple_command |
					function |
					brace_group |
					subshell |
					for |
					case |
					if_clause |
					while_clause |
					until_clause>
}
```

# subshell

> `subshell` node represents a subshell command. It consist of a group of one or more commands to execute in a separated shell environment.

```js
{
	type: 'subshell',
	list: compound_list
}
```

# for

> A for statement. The for loop shall execute a sequence of commands for each member in a list of items.

```js
 {
	type: 'for',
	name: name,
	wordlist: Array<word>,
	do: compound_list
}
```

# case

> A case statement. The conditional construct case shall execute the compound-list corresponding to the first one of several patterns that is matched by the `clause` word.

```js
{
	type: 'case',
	clause: word,
	cases: Array<case_item>
}
```

# case_item

> Represents a single pattern item in a `cases` list of a case. It's formed by the pattern to match against and the corresponding set of statements to execute if it is matched.

```js
{
	type: 'case_item',
	pattern: Array<word>,
	body: compound_list
}
```

# if

> If statement. The if command shall execute a compound-list and use its exit status to determine whether to execute the `then` compound-list or the optional `else` one.

```js
{
	type: 'if',
	clause: compound_list,
	then: compound_list,
	else: compound_list
}
```

# while

> While statement. The while loop shall continuously execute one compound-list as long as another compound-list has a zero exit status.

```js
{
	type: 'while',
	clause: compound_list,
	do: compound_list
}
```

# until

> Until statement. The until loop shall continuously execute one compound-list as long as another compound-list has a non-zero exit status.

```js
{
	type: 'until',
	clause: compound_list,
	do: compound_list
}
```

# word

> A `word` node could appear various part of the AST. It's formed by a series of characters, and is subjected to `tilde expansion`, `parameter expansion`, `command substitution`, `arithmetic expansion`, `pathname expansion`, `field splitting` and `quote removal`.

```js
{
	type: 'word',
	text: String,
	expansion: Array<arithmetic_expansion |
					 command_expansion |
					 parameter_expansion>
}
```

# assignment_word

> A special kind of word that represents assignment of a value to an environment variable.

```js
{
	type: 'assignment_word',
	text: String,
	expansion: Array<arithmetic_expansion |
					 command_expansion |
					 parameter_expansion>
}
```

# arithmetic_expansion

> Represent an arithmetic expansion operation to perform in the word.

> The parsing of the arithmetic expression is done using [Babel parser](https://github.com/babel/babylon). See there for the `arithmeticAST` node specification.

> The `start` property contains the index of the character in the word text where the substitution starts. The end property contains the index of the character in the word following the last one of the substitution. These two values are choosen to simplify the replacement in the string using the `slice` String method.

> `word.text.slice(0, exp.start) + value +  word.text.slice(exp.end)`

```js
{
	type: 'arithmetic_expansion',
	expression: String,
	arithmeticAST: Object,
	start:Number,
	end:Number
}
```

# command_expansion


> Represent a command substitution operation to perform on the word.

> The parsing of the command is done recursively using `bash-parser` itself.

> The `start` property contains the index of the character in the word text where the substitution starts. The end property contains the index of the character in the word following the last one of the substitution. These two values are choosen to simplify the replacement in the string using the `slice` String method.

> `word.text.slice(0, exp.start) + value +  word.text.slice(exp.end)`

```js
{
	type: 'command_expansion',
	command: String,
	commandAST: Object,
	start:Number,
	end:Number
}
```

# parameter_expansion

> Represent a parameter expansion operation to perform on the word.

> The `op` and `word` properties represents, in case of special parameters, respectively the operator used and the right word of the special parameter.

> The `start` property contains the index of the character in the word text where the substitution starts. The end property contains the index of the character in the word following the last one of the substitution. These two values are choosen to simplify the replacement in the string using the `slice` String method.

> `word.text.slice(0, exp.start) + value +  word.text.slice(exp.end)`

```js
{
	type: 'parameter_expansion',
	parameter: String,
	word: word,
	op: String,
	start:Number,
	end:Number
}
```

# io_redirect

> Represents the redirection of input or output stream of a command to or from a filename or another stream.

```js
{
	type: 'io_redirect',
	op: String,
	file: word,
	numberIo: Number
}
```
