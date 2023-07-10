'use strict';
const curry = require('lodash.curry');

function replace(oldItem, newItem, array) {
	return array.map(item => {
		if (item === oldItem) {
			return newItem;
		}

		return item;
	});
}

module.exports = curry(replace);

// This code was taken from:
// - https://www.npmjs.com/package/iterable-transform-replace
// - https://github.com/parro-it/iterable-transform-replace
// which is available under the MIT license
// It was modified to use lodash.curry instead of hughfdjackson's curry function
