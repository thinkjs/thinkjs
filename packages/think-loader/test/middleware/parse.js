const test = require('ava');
const mock = require('mock-require');

var assertCallParams;
function mockAssert() {
  if (!assertCallParams) {
    assertCallParams = [];
    mock('assert', (type, desc) => {
      assertCallParams.push(type, desc);
    });
  } else {
    assertCallParams.length = 0;
  }
  return assertCallParams;
}

function getInstance() {
  const Middleware = mock.reRequire('../../loader/middleware');
  return new Middleware();
}
test('middleware of type string', t => {
  const instance = getInstance();

  const handle = () => {};
  var result = instance.parse(['handler'], {handler() {
    return handle;
  }});

  t.is(result[0], handle);
});

test('assert middleware is a function', t => {
  var assertCallParams = mockAssert();
  const instance = getInstance();

  // const handle = () => {};
  t.throws(() => {
    instance.parse(['handler'], {handler: {}});
  }, Error);

  t.deepEqual(assertCallParams, [false, 'handle must be a function']);
});

test('assert middleware must return a function', t => {
  var assertCallParams = mockAssert();
  const instance = getInstance();

  // const handle = () => {};
  instance.parse(['handler'], {handler: () => {}});
  t.deepEqual(assertCallParams, [true, 'handle must be a function', false, 'handle must return a function']);
});

test('middleware will be filter when !!enable is false', t => {
  const instance = getInstance();
  const handle1 = () => {};
  const handle2 = () => {};
  const result = instance.parse([
    {
      handle: 'handler1',
      options: 'options not filter2'  // not filter
    },
    {
      handle: 'handler2',
      options: 'options not filter2',
      enable: false, // filter
      match: 'match',
      ignore: 'ignore'
    }
  ], {
    handler1(opt) {
      return handle1;
    },
    handler2(opt) {
      return handle2;
    }
  });

  t.deepEqual(result, [handle1]);
});

test('middleware will pass options', t => {
  const instance = getInstance();

  const handle1 = () => {};
  const handle2 = () => {};
  var params = [];
  instance.parse([
    {
      handle: 'handler1',
      options: 'options not filter2'  // not filter
    },
    {
      handle: 'handler2'
      // options: 'options not filter2', // pass {}
    }
  ], {
    handler1(opt) {
      params.push(opt);
      return handle1;
    },
    handler2(opt) {
      params.push(opt);
      return handle2;
    }
  });

  t.is(params[0], 'options not filter2');
  t.deepEqual(params[1], {});
});

test('middleware set match and ignore', t => {
  const instance = getInstance();

  const params = [];
  const handle = (ctx, next) => {
    params.push(ctx);
    next();
    return 'result';
  };
  var middlewares = instance.parse([
    {
      handle: 'handler',
      options: 'options',
      enable: 'true',
      match: '/admin/:name?',
      ignore: '/admin/a'
    }
  ], {handler() {
    return handle;
  }});
  const middleware = middlewares[0];
  const createNext = function(a) {
    return () => {
      params.push('next' + a);
      return 'next' + a;
    };
  };

  var result = middleware({path: '/admin'}, createNext(1));
  t.is(result, 'result');

  result = middleware({path: '/admin/b'}, createNext(2));
  t.is(result, 'result');

  result = middleware({path: '/admin/a'}, createNext(3));
  t.is(result, 'next3');

  result = middleware({path: '/user'}, createNext(4));
  t.is(result, 'next4');

  result = middleware({path: '/user/a'}, createNext(5));
  t.is(result, 'next5');

  t.deepEqual(params, [
    {path: '/admin'}, 'next1',
    {path: '/admin/b'}, 'next2',
    'next3',
    'next4',
    'next5'
  ]);
});

test('middleware will call path-to-regexp with right params', t => {
  const params = [];
  mock('path-to-regexp', function(a) {
    params.push(a);
  });
  const instance = getInstance();

  const handle = () => {};
  instance.parse([
    {
      handle: 'handler',
      options: 'options',
      enable: 'true',
      match: '/admin/:name?',
      ignore: '/admin/a'
    }
  ], {handler() {
    return handle;
  }});

  t.deepEqual(params, [
    '/admin/:name?',
    '/admin/a'
  ]);
});
