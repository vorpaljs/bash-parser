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

* callback: Function | Object

If a function is provided, it shall be the callback that produces an element of the new Iterable, taking three arguments:
	- currentValue - The current element being processed in the iterable.
	- index - The index of the current element being processed in the iterable.
	- context - an object shared between all calls to the function.

If an object is provided, it is interpreted as on option object with following properties:

	* callback: Function - see above
	* init: Function - optional init function that must return the initial value for `context`. If it's not provided, the iterable itself will be used as `context` initial value.


* data: Iterable

The source iterable to iterate over.

**Return value**

A new array with each element being the result of the callback function.




# License

The MIT License (MIT)

Copyright (c) 2016 Andrea Parodi
