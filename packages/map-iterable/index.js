'use strict';

const curry = require('curry');
const isIterable = require('is-iterable');

function map(callback, data) {
	if (typeof callback !== 'function') {
		throw new TypeError('Callback argument must be a function');
	}

	if (!isIterable(data)) {
		throw new TypeError('Data argument must be an iterable');
	}

	let idx = 0;
	const ctx = {};
	const dataIterator = data[Symbol.iterator]();
	return {
		[Symbol.iterator]() {
			return this;
		},

		next() {
			const item = dataIterator.next();
			if (!item.done) {
				item.value = callback(item.value, idx++, ctx);
			}
			return item;
		}
	};
}

module.exports = curry(map);
