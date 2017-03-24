const fs = require('fs');
const test = require('ava');
const Trace = require('../lib');

test('200', async t => {
  let ctx = {
    res: {
      statusCode: 200
    }
  };

  let next = () => {
    ctx.body = 'Hello World!';
  };

  await Trace()(ctx, next);
  t.true(ctx.body === 'Hello World!');
});
