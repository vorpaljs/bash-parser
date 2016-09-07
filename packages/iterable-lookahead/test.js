/* eslint-disable camelcase */
import test from 'ava';
import isIterable from 'is-iterable';
import iterableLookahead from '.';

const expected1 = [{
	item: 1,
	ahead: 2,
	behind: undefined
}, {
	item: 2,
	ahead: 3,
	behind: 1
}, {
	item: 3,
	ahead: 4,
	behind: 2
}, {
	item: 4,
	ahead: undefined,
	behind: 3
}];

const expected2 = [{
	item: 1,
	ahead: 3,
	behind: undefined
}, {
	item: 2,
	ahead: 4,
	behind: undefined
}, {
	item: 3,
	ahead: undefined,
	behind: 1
}, {
	item: 4,
	ahead: undefined,
	behind: 2
}];

test('return an iterable', t => {
	t.is(isIterable(iterableLookahead([])), true);
});

test('resulting iterable is equivalent to the initial one', t => {
	t.deepEqual(Array.from(iterableLookahead([1, 2, 3])), [1, 2, 3]);
});

test('resulting iterable has a ahead method', t => {
	const it = iterableLookahead([]);
	t.is(typeof it.ahead, 'function');
});

test('resulting iterable has a behind method', t => {
	const it = iterableLookahead([]);
	t.is(typeof it.behind, 'function');
});

test('behind and ahead indexes defaults to 1', t => {
	const it = iterableLookahead([1, 2, 3, 4]);
	const result = [];

	for (const item of it) {
		result.push({
			item,
			ahead: it.ahead(1),
			behind: it.behind(1)
		});
	}

	t.deepEqual(result, expected1);
});

test('spread syntax', t => {
	const result = [];

	for (const [item, look] of iterableLookahead.spread([1, 2, 3, 4])) {
		result.push({
			item,
			ahead: look.ahead(1),
			behind: look.behind(1)
		});
	}

	t.deepEqual(result, expected1);
});

test('behind and ahead works with indexes smaller than size', t => {
	const it = iterableLookahead([1, 2, 3, 4], 2);
	const result = [];

	for (const item of it) {
		result.push({
			item,
			ahead: it.ahead(1),
			behind: it.behind(1)
		});
	}
	t.deepEqual(result, Object.assign(expected1.concat(), {}));
});

test('behind and ahead use index', t => {
	const it = iterableLookahead([1, 2, 3, 4], 2);
	const result = [];

	for (const item of it) {
		const r = {
			item,
			ahead: it.ahead(2),
			behind: it.behind(2)
		};
		result.push(r);
	}
	t.deepEqual(result, expected2);
});

test('behind and ahead works with size greater than array', t => {
	const it = iterableLookahead([1, 2, 3, 4], 13);
	const result = [];

	for (const item of it) {
		const r = {
			item,
			ahead: it.ahead(2),
			behind: it.behind(2)
		};
		result.push(r);
	}
	t.deepEqual(result, expected2);
});

test('throws if lookahead or lookbehind are over size', t => {
	const it = iterableLookahead([1, 2, 3, 4], 1);
	const err1 = t.throws(() => it.ahead(2));
	const err2 = t.throws(() => it.behind(2));

	t.is(err1.message, 'Cannot look ahead of 2 position, currently depth is 1');
	t.is(err2.message, 'Cannot look behind of 2 position, currently depth is 1');
	t.true(err1 instanceof RangeError);
	t.true(err2 instanceof RangeError);
});

test('throws if size is smaller than 1', t => {
	const err1 = t.throws(() => iterableLookahead([1, 2, 3, 4], -1));
	const err2 = t.throws(() => iterableLookahead([1, 2, 3, 4], 0));

	t.is(err1.message, 'Size argument must be greater than 0');
	t.is(err2.message, 'Size argument must be greater than 0');
	t.true(err1 instanceof RangeError);
	t.true(err2 instanceof RangeError);
});

test('throws if size is not a number', t => {
	const err1 = t.throws(() => iterableLookahead([1, 2, 3, 4], '12'));
	// eslint-disable-next-line no-new-wrappers
	iterableLookahead([1, 2, 3, 4], new Number(12));

	t.is(err1.message, 'Size argument must be a number');
	t.true(err1 instanceof TypeError);
});

test('throws if lookahead or lookbehind are <= 0', t => {
	const it = iterableLookahead([1, 2, 3, 4], 1);
	const err1 = t.throws(() => it.ahead(-2));
	const err2 = t.throws(() => it.behind(-2));
	const err3 = t.throws(() => it.ahead(-2));
	const err4 = t.throws(() => it.behind(-2));

	t.is(err1.message, 'Look ahead index must be greater than 0');
	t.is(err2.message, 'Look behind index must be greater than 0');
	t.is(err3.message, 'Look ahead index must be greater than 0');
	t.is(err4.message, 'Look behind index must be greater than 0');
	t.true(err1 instanceof RangeError);
	t.true(err2 instanceof RangeError);
	t.true(err3 instanceof RangeError);
	t.true(err4 instanceof RangeError);
});

