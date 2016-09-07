# map-iterable

> Array.prototype.map analog for iterables.

[![Travis Build Status](https://img.shields.io/travis/parro-it/map-iterable.svg)](http://travis-ci.org/parro-it/map-iterable)
[![Coveralls](https://img.shields.io/coveralls/parro-it/map-iterable.svg?maxAge=2592000)](https://coveralls.io/github/parro-it/map-iterable)
[![NPM module](https://img.shields.io/npm/v/map-iterable.svg)](https://npmjs.org/package/map-iterable)
[![NPM downloads](https://img.shields.io/npm/dt/map-iterable.svg)](https://npmjs.org/package/map-iterable)


The map() method creates a new iterable with the results of calling a provided function on every element in given iterable.

The function is curried, so you can omit the data argument and you get a function that map over the provide function.

# Installation

```bash
npm install --save map-iterable
```

# Examples

```js
	const map = require('map-iterable');
	const numbers = [1, 4, 9];
	const roots = Array.from(
		map(Math.sqrt, numbers)
	);
// roots is now [1, 2, 3], numbers is still [1, 4, 9]

```

**using curry**

```js
	const map = require('map-iterable');
	const mapSqrt = map(Math.sqrt);
	const numbers = [1, 4, 9];
	cons
	const roots = Array.from(mapSqrt(numbers))
// roots is now [1, 2, 3], numbers is still [1, 4, 9]

```


# Syntax

### `map(callback, data)`

**Parameters**

* callback

Function that produces an element of the new Iterable, taking three arguments:
	- currentValue - The current element being processed in the iterable.
	- index - The index of the current element being processed in the iterable.
	- ctx - an object shared between all calls to the function.

**Return value**

A new array with each element being the result of the callback function.

* data

The source iterable to iterate over.


# License

The MIT License (MIT)

Copyright (c) 2016 Andrea Parodi
