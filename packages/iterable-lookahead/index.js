'use strict';

function lookahead(iterable, size) {
	if (size === undefined) {
		size = 1;
	}

	if (typeof size !== 'number' && !(size instanceof Number)) {
		throw new TypeError('Size argument must be a number');
	}

	if (size < 1) {
		throw new RangeError('Size argument must be greater than 0');
	}

	const behindCache = new Array(size + 1);
	const aheadCache = [];

	const iterator = iterable[Symbol.iterator]();

	return {
		ahead(idx) {
			if (idx > size) {
				throw new RangeError(`Cannot look ahead of ${idx} position, currently depth is ${size}`);
			}

			if (idx < 1) {
				throw new RangeError('Look ahead index must be greater than 0');
			}

			return aheadCache[idx - 1];
		},

		behind(idx) {
			if (idx > size) {
				throw new RangeError(`Cannot look behind of ${idx} position, currently depth is ${size}`);
			}

			if (idx < 1) {
				throw new RangeError('Look behind index must be greater than 0');
			}
			// console.log({behindCache});
			return behindCache[idx];
		},

		[Symbol.iterator]() {
			return this;
		},

		next() {
			let item = iterator.next();
			while (!item.done && aheadCache.length <= size) {
				aheadCache.push(item.value);
				item = iterator.next();
			}
			if (!item.done) {
				aheadCache.push(item.value);
			}

			if (item.done && aheadCache.length === 0) {
				return {done: true};
			}

			const value = aheadCache.shift();

			behindCache.unshift(value);
			behindCache.pop();

			return {done: false, value};
		}
	};
}

lookahead.depth = size => iterable => lookahead(iterable, size);

lookahead.spread = function lookaheadSpread(iterable, size) {
	const it = lookahead(iterable, size);

	it._next = it.next;
	it.next = function () {
		let item = this._next();
		if (!item.done) {
			item.value = [item.value, it];
		}
		return item;
	};

	return it;
};

module.exports = lookahead;
