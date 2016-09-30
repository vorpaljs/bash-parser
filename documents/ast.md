# AST

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Introduction](#introduction)
- [Script](#Script)
- [Pipeline](#Pipeline)
- [LogicalExpression](#LogicalExpression)
- [SimpleCommand](#SimpleCommand)
- [Function](#Function)
- [Name](#Name)
- [CompoundList](#CompoundList)
- [Subshell](#Subshell)
- [Case](#Case)
- [CaseItem](#CaseItem)
- [If](#If)
- [While](#While)
- [Until](#Until)
- [Word](#Word)
- [AssignmentWord](#AssignmentWord)
- [ArithmeticExpansion](#ArithmeticExpansion)
- [CommandExpansion](#CommandExpansion)
- [ParameterExpansion](#ParameterExpansion)
- [Redirect
					type: 'Word'](#Redirect
					type: 'Word')

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


# Script

> `Script` is the root node of the AST.


```js
{
	type: 'Script',
	commands: Array<LogicalExpression |
					Pipeline |
					SimpleCommand |
					Function |
					Subshell |
					for |
					Case |
					if_clause |
					While_clause |
					Until_clause>
}
```

# Pipeline

> `Pipeline` represents a list of commands concatenated with pipes.

> Commands are executed in parallel and the output of each one become the input of the subsequent.

```js
{
	type: 'Pipeline',
	commands: Array<SimpleCommand |
					Function |
					brace_group |
					Subshell |
					for |
					Case |
					If_clause |
					While_clause |
					Until_clause>
}
```

# LogicalExpression

> Represents two commands (left and right) concateneted in a `and` (&&) or `or` (||) operation.

> In the `and` Case, the right command is executed only if the left one is executed successfully. In the `or` Case, the right command is executed only if the left one fails.

```js
{
	type: 'LogicalExpression',
	op: string,
	left: LogicalExpression |
		  Pipeline |
		  SimpleCommand |
		  Function |
		  brace_group |
		  Subshell |
		  for |
		  Case |
		  If_clause |
		  While_clause |
		  Until_clause,
	right: LogicalExpression |
		   Pipeline |
		   SimpleCommand |
		   Function |
		   brace_group |
		   Subshell |
		   for |
		   Case |
		   If_clause |
		   While_clause |
		   Until_clause
}
```

# SimpleCommand
> Represents a builtin or external command to execute. It could optionally have a list of arguments, stream redirection operation and environment variable assignments.

```js
{
	type: 'SimpleCommand',
	Name: Ford,
	prefix: Array<AssignmentWord | Redirect
					type: 'Word'>,
	suffix: Array<Word | Redirect
					type: 'Word'>
}
```

# Function

> `Function` represents the definition of a Function.

> It is formed by the Name of the Function  itself and a list of all command that forms the body of the Function.

```js
{
	type: 'Function',
	Name: Name,
	body: CompoundList
}
```

# Name

> Represents the Name of a Function or a `for` variable.

> Valid Name values should be formed by one or more alphanumeric characters or underscores, and the could not start with a digit.

```js
{
	type: 'Name',
	text: String
}
```

# CompoundList

> `CompoundList` represent a group of commands that form the body of `for`, `Until` `While`, `if`, `else`, `Case` items and `Function` command.

```js
{
	type: 'CompoundList',
	commands: Array<LogicalExpression |
					Pipeline |
					SimpleCommand |
					Function |
					brace_group |
					Subshell |
					for |
					Case |
					If_clause |
					While_clause |
					Until_clause>
}
```

# Subshell

> `Subshell` node represents a Subshell command. It consist of a group of one or more commands to execute in a separated shell environment.

```js
{
	type: 'Subshell',
	list: CompoundList
}
```

# for

> A for statement. The for loop shall execute a sequence of commands for each member in a list of items.

```js
 {
	type: 'for',
	Name: Name,
	Wordlist: Array<Word>,
	do: CompoundList
}
```

# Case

> A Case statement. The conditional construct Case shall execute the compound-list corresponding to the first one of several patterns that is matched by the `clause` Word.

```js
{
	type: 'Case',
	clause: Word,
	Cases: Array<CaseItem>
}
```

# CaseItem

> Represents a single pattern item in a `Cases` list of a Case. It's formed by the pattern to match against and the corresponding set of statements to execute if it is matched.

```js
{
	type: 'CaseItem',
	pattern: Array<Word>,
	body: CompoundList
}
```

# If

> If statement. The if command shall execute a compound-list and use its exit status to determine whether to execute the `then` compound-list or the optional `else` one.

```js
{
	type: 'If',
	clause: CompoundList,
	then: CompoundList,
	else: CompoundList
}
```

# While

> While statement. The While loop shall continuously execute one compound-list as long as another compound-list has a zero exit status.

```js
{
	type: 'While',
	clause: CompoundList,
	do: CompoundList
}
```

# Until

> Until statement. The Until loop shall continuously execute one compound-list as long as another compound-list has a non-zero exit status.

```js
{
	type: 'Until',
	clause: CompoundList,
	do: CompoundList
}
```

# Word

> A `Word` node could appear various part of the AST. It's formed by a series of characters, and is subjected to `tilde expansion`, `parameter expansion`, `command substitution`, `arithmetic expansion`, `pathName expansion`, `field splitting` and `quote removal`.

```js
{
	type: 'Word',
	text: String,
	expansion: Array<ArithmeticExpansion |
					 CommandExpansion |
					 ParameterExpansion>
}
```

# AssignmentWord

> A special kind of Word that represents assignment of a value to an environment variable.

```js
{
	type: 'AssignmentWord',
	text: String,
	expansion: Array<ArithmeticExpansion |
					 CommandExpansion |
					 ParameterExpansion>
}
```

# ArithmeticExpansion

> Represent an arithmetic expansion operation to perform in the Word.

> The parsing of the arithmetic expression is done using [Babel parser](https://github.com/babel/babylon). See there for the `arithmeticAST` node specification.

> The `start` property contains the index of the character in the Word text where the substitution starts. The end property contains the index of the character in the Word following the last one of the substitution. These two values are choosen to simplify the replacement in the string using the `slice` String method.

> `Word.text.slice(0, exp.start) + value +  Word.text.slice(exp.end)`

```js
{
	type: 'ArithmeticExpansion',
	expression: String,
	arithmeticAST: Object,
	start:Number,
	end:Number
}
```

# CommandExpansion


> Represent a command substitution operation to perform on the Word.

> The parsing of the command is done recursively using `bash-parser` itself.

> The `start` property contains the index of the character in the Word text where the substitution starts. The end property contains the index of the character in the Word following the last one of the substitution. These two values are choosen to simplIfy the replacement in the string using the `slice` String method.

> `Word.text.slice(0, exp.start) + value +  Word.text.slice(exp.end)`

```js
{
	type: 'CommandExpansion',
	command: String,
	commandAST: Object,
	start:Number,
	end:Number
}
```

# ParameterExpansion

> Represent a parameter expansion operation to perform on the Word.

> The `op` and `Word` properties represents, in Case of special parameters, respectively the operator used and the right Word of the special parameter.

> The `start` property contains the index of the character in the Word text where the substitution starts. The end property contains the index of the character in the Word following the last one of the substitution. These two values are choosen to simplify the replacement in the string using the `slice` String method.

> `Word.text.slice(0, exp.start) + value +  Word.text.slice(exp.end)`

```js
{
	type: 'ParameterExpansion',
	parameter: String,
	Word: Word,
	op: String,
	start:Number,
	end:Number
}
```

# Redirect
					type: 'Word'

> Represents the redirection of input or output stream of a command to or from a filename or another stream.

```js
{
	type: 'Redirect
					type: 'Word'',
	op: String,
	file: Word,
	numberIo: Number
}
```
