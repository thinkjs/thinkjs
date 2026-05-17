const test = require('ava');
const helmet = require('../index.js');

test('helmet', t => {
  t.is(typeof helmet === 'function', true);
});
