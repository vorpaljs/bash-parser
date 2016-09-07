# iterable-lookahead

> Iterable wrapper that add methods to read ahead or behind current item.

[![Travis Build Status](https://img.shields.io/travis/parro-it/iterable-lookahead.svg)](http://travis-ci.org/parro-it/iterable-lookahead)
[![Coveralls](https://img.shields.io/coveralls/parro-it/iterable-lookahead.svg?maxAge=2592000)](https://coveralls.io/github/parro-it/iterable-lookahead)
[![NPM module](https://img.shields.io/npm/v/iterable-lookahead.svg)](https://npmjs.org/package/iterable-lookahead)
[![NPM downloads](https://img.shields.io/npm/dt/iterable-lookahead.svg)](https://npmjs.org/package/iterable-lookahead)

# Installation

```bash
npm install --save iterable-lookahead
```

## Usage

```js
	const lookahead = require('iterable-lookahead');
	const iterable = lookahead([1, 2, 3, 4]);

	for (const item of iterable) {
		console.log({
			item,
			ahead: iterable.ahead(1),
			behind: iterable.behind(1)
		});
	}

```

or otherwise, using array spread syntax:

```js
	const lookahead = require('iterable-lookahead');

	for (const [item, look] of lookahead.spread([1, 2, 3, 4])) {
		console.log({
			item,
			ahead: look.ahead(1),
			behind: look.behind(1)
		});
	}

```

# License

The MIT License (MIT)

Copyright (c) 2016 Andrea Parodi
