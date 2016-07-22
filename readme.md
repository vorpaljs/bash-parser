# bash-parser

Parses bash source code into an AST

[![Travis Build Status](https://img.shields.io/travis/parro-it/bash-parser.svg)](http://travis-ci.org/parro-it/bash-parser)
[![Coveralls](https://img.shields.io/coveralls/parro-it/bash-parser.svg?maxAge=2592000)](https://coveralls.io/github/parro-it/bash-parser)
[![NPM module](https://img.shields.io/npm/v/bash-parser.svg)](https://npmjs.org/package/bash-parser)
[![NPM downloads](https://img.shields.io/npm/dt/bash-parser.svg)](https://npmjs.org/package/bash-parser)

# Installation

```bash
npm install --save bash-parser
```

## Usage

```js
  const parse = require('bash-parser');
  const ast = parse('echo foo>file.txt');
```

you get this AST:

```
{
	type: 'list',
	andOrs: [{
		type: 'andOr',
		left: [{
			type: 'simple_command',
			name: 'echo',
			suffix: {
				type: 'cmd_suffix',
				list: [
					'foo',
					{
						type: 'io_redirect',
						op: ',
						file: 'file.txt'
					}
				]
			}
		}]
	}]
}
```

# Related projects

* [cash](https://github.com/dthree/cash) - These parser should become the parser used by `cash`
* [nsh](https://github.com/piranna/nsh) - These parser should become the parser used by `nsh`
* [js-shell-parse](https://github.com/grncdr/js-shell-parse) - bash-parser was born as a fork of `js-shell-parse`, then it switched to `jison` grammar and was completely rewritten.
* [jison](https://github.com/zaach/jison) - Bison in JavaScript.



# License

The MIT License (MIT)

Copyright (c) 2016 vorpaljs
