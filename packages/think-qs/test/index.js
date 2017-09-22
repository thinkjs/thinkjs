const test = require('ava');
const qs = require('../index.js');

const next = () => {
  return Promise.resolve();
};

test('init', t => {
  const fn = qs();
  t.is(typeof fn === 'function', true);
});

test('query', async t => {
  const fn = qs();
  const ctx = {
    request: {
      querystring: ''
    }
  };
  await fn(ctx, next);
  t.deepEqual(ctx.request._query, {});
});

test('query 2', async t => {
  const fn = qs();
  const ctx = {
    request: {
      querystring: 'name=value'
    }
  };
  await fn(ctx, next);
  t.deepEqual(ctx.request._query, {name: 'value'});
});

test('query 3', async t => {
  const fn = qs();
  const ctx = {
    request: {
      querystring: 'name=value&name=value2'
    }
  };
  await fn(ctx, next);
  t.deepEqual(ctx.request._query, {name: ['value', 'value2']});
});

test('query 4', async t => {
  const fn = qs();
  const ctx = {
    request: {
      querystring: 'name[]=value&name[]=value2'
    }
  };
  await fn(ctx, next);
  t.deepEqual(ctx.request._query, {name: ['value', 'value2']});
});

test('query 5', async t => {
  const fn = qs();
  const ctx = {
    request: {
      querystring: 'name[ww]=value&name[ss]=value2'
    }
  };
  await fn(ctx, next);
  t.deepEqual(ctx.request._query, {name: {ww: 'value', ss: 'value2'}});
});

test('query 6, not enable', async t => {
  const fn = qs({query: false});
  const ctx = {
    request: {
      querystring: 'name[ww]=value&name[ss]=value2'
    }
  };
  await fn(ctx, next);
  t.deepEqual(ctx.request._query, undefined);
});

test('post 1, not enable', async t => {
  const fn = qs({post: false});
  const ctx = {
    request: {
      body: {
        post: {}
      }
    }
  };
  await fn(ctx, next);
  t.deepEqual(ctx.request.body.post, {});
});
test('post 2, not enable', async t => {
  const fn = qs({post: false});
  const ctx = {
    request: {
      body: {
        post: {
          'www[]': 'sss'
        }
      }
    }
  };
  await fn(ctx, next);
  t.deepEqual(ctx.request.body.post, {'www[]': 'sss'});
});
test('post 2, not enable', async t => {
  const fn = qs({});
  const ctx = {
    request: {
      body: {
        post: {
          'www[]': 'sss'
        }
      }
    }
  };
  await fn(ctx, next);
  t.deepEqual(ctx.request.body.post, {'www': ['sss']});
});

test('post 3', async t => {
  const fn = qs({});
  const ctx = {
    request: {
      body: {
        post: {
          'www[www]': 'sss'
        }
      }
    }
  };
  await fn(ctx, next);
  t.deepEqual(ctx.request.body.post, {'www': {'www': 'sss'}});
});

test('post 4', async t => {
  const fn = qs({});
  const ctx = {
    request: {
      body: {
        post: {
          'www': 'sss'
        }
      }
    }
  };
  await fn(ctx, next);
  t.deepEqual(ctx.request.body.post, {'www': 'sss'});
});
