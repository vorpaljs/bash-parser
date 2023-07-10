'use strict';

function * spread(source) {
	for (const item of source) {
		if (typeof item[Symbol.iterator] === 'function') {
			yield* item;
		} else {
			yield item;
		}
	}
}

module.exports = spread;

// This code was taken from:
// - https://www.npmjs.com/package/transform-spread-iterable
// - https://github.com/parro-it/transform-spread-iterable
// which is available under the MIT license
// It was vendored to avoid the (unnecessary) dependency on hughfdjackson's curry package
