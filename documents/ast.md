# Bash parser AST types

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Introduction](#introduction)
- [Script](#Script)
- [Pipeline](#Pipeline)
- [LogicalExpression](#LogicalExpression)
- [Command](#Command)
- [Function](#Function)
- [Name](#Name)
- [CompoundList](#CompoundList)
- [Subshell](#Subshell)
- [Case](#Case)
- [CaseItem](#CaseItem)
- [If](#If)
- [For](#For)
- [While](#While)
- [Until](#Until)
- [Word](#Word)
- [AssignmentWord](#AssignmentWord)
- [ArithmeticExpansion](#ArithmeticExpansion)
- [CommandExpansion](#CommandExpansion)
- [ParameterExpansion](#ParameterExpansion)
- [Redirect](#Redirect)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Introduction

### Node Type

Each AST node has a `type` property that define the type of the node.

### Token Codepoints

If the source is parsed specifing the `insertLOC` option, each node contins a `loc` property that contains the starting and ending lines and columns of the node, and the start and end index of the character in the source string:

```js
{
	type: 'WORD',
	value: 'ls',
	loc: {
		start: {
			row: Number,
			col: Number,
			char: 42
		},
		end: {
			row: Number,
			col: Number,
			char: 43
		}
	}
}
```

## Node types

### Script

> `Script` is the root node of the AST. It simply represent a list of commands that form the body of the script.


```js
{
	type: 'Script',
	commands: Array<LogicalExpression |
					Pipeline |
					Command |
					Function |
					Subshell |
					For |
					Case |
					if |
					While |
					Until>
}
```

### Pipeline

> `Pipeline` represents a list of commands concatenated with pipes.

> Commands are executed in parallel and the output of each one become the input of the subsequent.

```js
{
	type: 'Pipeline',
	commands: Array<Command |
					Function |
					Subshell |
					For |
					Case |
					If |
					While |
					Until>
}
```

### LogicalExpression

> Represents two commands (left and right) concateneted in a `and` (&&) or `or` (||) operation.

> In the `and` Case, the right command is executed only if the left one is executed successfully. In the `or` Case, the right command is executed only if the left one fails.

```js
{
	type: 'LogicalExpression',
	op: string,
	left: LogicalExpression |
		  Pipeline |
		  Command |
		  Function |
		  Subshell |
		  For |
		  Case |
		  If |
		  While |
		  Until,
	right: LogicalExpression |
		   Pipeline |
		   Command |
		   Function |
		   Subshell |
		   For |
		   Case |
		   If |
		   While |
		   Until
}
```

### Command
> Represents a builtin or external command to execute. It could optionally have a list of arguments, stream redirection operation and environment variable assignments. `name` properties is a Word that represents the name of the command to execute. It is optional because Command could represents bare assignment, e.g. `VARNAME = 42;`. In this case, the command node has no name.

```js
{
	type: 'Command',
	name: ?Word,
	prefix: Array<AssignmentWord | Redirect>,
	suffix: Array<Word | Redirect>
}
```

### Function

> `Function` represents the definition of a Function.

> It is formed by the name of the Function  itself and a list of all command that forms the body of the Function. It can also contains a list of redirection that applies to all commands of the function body.

```js
{
	type: 'Function',
	name: Name,
	redirections: Array<Redirect>
	body: CompoundList
}
```

### Name

> Represents the Name of a Function or a `for` variable.

> Valid Name values should be formed by one or more alphanumeric characters or underscores, and the could not start with a digit.

```js
{
	type: 'Name',
	text: string
}
```

### CompoundList

> `CompoundList` represent a group of commands that form the body of `for`, `until` `while`, `if`, `else`, `case` items and `function` command. It can also represent a simple group of commands, with an optional list of redirections.

```js
{
	type: 'CompoundList',
	commands: Array<LogicalExpression |
					Pipeline |
					Command |
					Function |
					Subshell |
					For |
					Case |
					If |
					While |
					Until>
	redirections: Array<Redirect>
}
```

### Subshell

> `Subshell` node represents a Subshell command. It consist of a group of one or more commands to execute in a separated shell environment.

```js
{
	type: 'Subshell',
	list: CompoundList
}
```

### For

> A for statement. The for loop shall execute a sequence of commands for each member in a list of items.

```js
 {
	type: 'For',
	name: Name,
	wordlist: Array<Word>,
	do: CompoundList
}
```

### Case

> A Case statement. The conditional construct Case shall execute the CompoundList corresponding to the first one of several patterns that is matched by the `clause` Word.

```js
{
	type: 'Case',
	clause: Word,
	cases: Array<CaseItem>
}
```

### CaseItem

> Represents a single pattern item in a `Cases` list of a Case. It's formed by the pattern to match against and the corresponding set of statements to execute if it is matched.

```js
{
	type: 'CaseItem',
	pattern: Array<Word>,
	body: CompoundList
}
```

### If

> If statement. The if command shall execute a CompoundList and use its exit status to determine whether to execute the `then` CompoundList or the optional `else` one.

```js
{
	type: 'If',
	clause: CompoundList,
	then: CompoundList,
	else: CompoundList
}
```

### While

> While statement. The While loop shall continuously execute one CompoundList as long as another CompoundList has a zero exit status.

```js
{
	type: 'While',
	clause: CompoundList,
	do: CompoundList
}
```

### Until

> Until statement. The Until loop shall continuously execute one CompoundList as long as another CompoundList has a non-zero exit status.

```js
{
	type: 'Until',
	clause: CompoundList,
	do: CompoundList
}
```

### Redirect

> Represents the redirection of input or output stream of a command to or from a filename or another stream.

```js
{
	type: 'Redirect',
	op: string,
	file: word,
	numberIo: Number
}
```

### Word

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

### AssignmentWord

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

## Expansions node types

Word and AssignmentWord could optionally contain a list of expansion to perform on the token.

### ArithmeticExpansion

> Represent an arithmetic expansion operation to perform in the Word.

> The parsing of the arithmetic expression is done using [Babel parser](https://github.com/babel/babylon). See there for the `arithmeticAST` node specification.

> The `loc.start` property contains the index of the character in the Word text where the substitution starts. The `loc.end` property contains the index where it the ends.

```js
{
	type: 'ArithmeticExpansion',
	expression: string,
	resolved: boolean,
	arithmeticAST: Object,
	loc: {
		start:Number,
		end:Number
	}
}
```

### CommandExpansion

> Represent a command substitution operation to perform on the Word.

> The parsing of the command is done recursively using `bash-parser` itself.

> The `loc.start` property contains the index of the character in the Word text where the substitution starts. The `loc.end` property contains the index where it the ends.

```js
{
	type: 'CommandExpansion',
	command: string,
	resolved: boolean,
	commandAST: Object,

	loc: {
		start:Number,
		end:Number
	}
}
```

### ParameterExpansion

> Represent a parameter expansion operation to perform on the Word.

> The `op` and `Word` properties represents, in the case of special parameters, respectively the operator used and the right Word of the special parameter.

> The `loc.start` property contains the index of the character in the Word text where the substitution starts. The `loc.end` property contains the index where it the ends.

> TODO: add some details on special parameters and kinds

```js
{
	type: 'ParameterExpansion',
	parameter: string,
	kind: ?string,
	word: ?string,
	op: ?string,
	loc: {
		start:Number,
		end:Number
	}
}
```

