const test = require('tape');
const bashParser = require('./');

test('it work!', t => {
  const result = bashParser();
  t.equal(result, 42);
  t.end();
});
