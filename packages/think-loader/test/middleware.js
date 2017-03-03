const test = require('ava');
const mock = require('mock-require');
const path = require('path');

var depsCalledParams;
function mockDeps() {
  if(!depsCalledParams) {
    depsCalledParams = []

    mock(path.join('appPath', 'common/config/middleware.js'), {value: 'MultiModuleMiddlewares'});
    mock(path.join('appPath', 'config/middleware.js'), {value: 'Middlewares'});

    mock('../loader/middleware-load-files', function(a, b, c) {
      depsCalledParams.push(a, b, c);
      return 'loadMiddlewareFiles call result';
    });

    mock('../loader/middleware-parse', function(e, f) {
      depsCalledParams.push(e, f);
      return 'parseMiddleware call result';
    });
  } else {
    depsCalledParams.length = 0;
  }

  return depsCalledParams;
}

test('load middleware isMultiModule === true', t=>{
  const params = mockDeps();
  const loadMiddleware = require('../loader/middleware').load;

  const result = loadMiddleware('appPath', true, 'thinkPath');

  t.deepEqual(params, [
    'appPath', true, 'thinkPath',
    {value: 'MultiModuleMiddlewares'}, 'loadMiddlewareFiles call result'
  ]);

  t.is(result, 'parseMiddleware call result');
});

test('load middleware isMultiModule === false', t=>{
  const params = mockDeps();
  const loadMiddleware = require('../loader/middleware').load;

  const result = loadMiddleware('appPath', false, 'thinkPath');

  t.deepEqual(params, [
    'appPath', false, 'thinkPath',
    {value: 'Middlewares'}, 'loadMiddlewareFiles call result'
  ]);

  t.is(result, 'parseMiddleware call result');
});
