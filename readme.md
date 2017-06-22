# bash-parser

Parses bash source code to produce an AST

[![Travis Build Status](https://img.shields.io/travis/vorpaljs/bash-parser/master.svg)](http://travis-ci.org/vorpaljs/bash-parser)
[![Coveralls](https://img.shields.io/coveralls/vorpaljs/bash-parser.svg?maxAge=2592000)](https://coveralls.io/github/vorpaljs/bash-parser)
[![NPM module](https://img.shields.io/npm/v/bash-parser.svg)](https://npmjs.org/package/bash-parser)
[![NPM downloads](https://img.shields.io/npm/dt/bash-parser.svg)](https://npmjs.org/package/bash-parser)
[![Try online](https://img.shields.io/badge/try_it-online!-yellow.svg)](https://vorpaljs.github.io/bash-parser-playground/)

# Installation

```bash
npm install --save bash-parser
```

# Usage

```js
  const parse = require('bash-parser');
  const ast = parse('echo ciao');
```

`ast` result is:

```js
{
		type: "Script",
		commands: [
			{
				type: "SimpleCommand",
				name: {
					text: "echo",
					type: "Word"
				},
				suffix: [
					{
						text: "ciao",
						type: "Word"
					}
				]
			}
		]
	}
```

# Related projects

* [cash](https://github.com/dthree/cash) - This parser should become the parser used by `cash` (and also [vorpal](https://github.com/dthree/vorpal))
* [nsh](https://github.com/piranna/nsh) - This parser should become the parser used by `nsh`
* [js-shell-parse](https://github.com/grncdr/js-shell-parse) - bash-parser was born as a fork of `js-shell-parse`, but was rewritten to use a `jison` grammar
* [jison](https://github.com/zaach/jison) - Bison in JavaScript.

# Documentation

Look in [documents folder](https://github.com/vorpaljs/bash-parser/tree/master/documents)

# License

The MIT License (MIT)

Copyright (c) 2016 vorpaljs
