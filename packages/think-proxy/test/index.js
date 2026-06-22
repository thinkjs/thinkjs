const test = require('ava');
const proxy = require('..');

test('requires non-empty options', t => {
  const error = t.throws(() => proxy());
  t.regex(error.message, /must have options/);
});

test('requires options to be an array or object', t => {
  const error = t.throws(() => proxy('invalid'));
  t.regex(error.message, /options must be an array or an object/);
});

test('creates middleware from array options', async t => {
  const middleware = proxy([{
    host: 'http://example.com',
    suppressRequestHeaders: ['X-Request-Id'],
    suppressResponseHeaders: ['X-Powered-By']
  }]);
  let calledNext = false;

  await middleware({path: '/api'}, async() => {
    calledNext = true;
  });

  t.false(calledNext);
});
