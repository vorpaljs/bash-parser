/* eslint-disable camelcase */
import test from 'ava';
import isIterable from 'is-iterable';
import map from '.';

const fixture = [1, 2, 3];
const expected = [2, 4, 6];
const expectedIdx = [0, 1, 2];
const double = n => n * 2;
const indexCb = (_, idx) => idx;
const contextCb = (_, __, ctx) => {
	ctx.tot = (ctx.tot || 0);
	return ctx.tot++;
};

test('return an iterable', t => {
	t.is(isIterable(map(() => null, [])), true);
});

test('apply the callback to every item', t => {
	const results = map(double, fixture);
	t.deepEqual(
		Array.from(results),
		expected
	);
});

test('pass item index to the callback', t => {
	t.deepEqual(
		Array.from(map(indexCb, fixture)),
		expectedIdx
	);
});

test('pass context object to the callback', t => {
	t.deepEqual(
		Array.from(map(contextCb, fixture)),
		expectedIdx
	);
});

test('accept an option object with init function for context', t => {
	const opt = {
		callback: contextCb,
		init() {
			return {tot: 1};
		}
	};
	const results = Array.from(map(opt, fixture));
	delete fixture.tot;
	t.deepEqual(results, fixture);
});

test('context set to default if init function is not provided', t => {
	const opt = {
		callback: contextCb
	};
	t.deepEqual(
		Array.from(map(opt, fixture)),
		expectedIdx
	);
});

test('can be curried', t => {
	const mapDouble = map(double);

	t.deepEqual(
		Array.from(mapDouble(fixture)),
		expected
	);
});

test('throws if data is not iterable', t => {
	const err = t.throws(() => map(double, 42));
	t.is(err.message, 'Data argument must be an iterable');
	t.true(err instanceof TypeError);
});

test('throws if callback is not a function nor an object', t => {
	const err = t.throws(() => map(42, []));
	t.is(err.message, 'Callback argument must be a function or option object');
	t.true(err instanceof TypeError);
});
