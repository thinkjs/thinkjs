const test = require('ava');
const mock = require('mock-require');
const path = require('path');

function mockHelper(isFile) {
  var params = [];
  const helper = require('think-helper');
  helper.isFile = (p) => {
    params.push(p);
    return isFile;
  };
  return params;
}

function mockDeps(instance) {
  var depsCalledParams = [];

  instance.interopRequire = function(p) {
    if (path.join('appPath', 'common/config/middleware.js') === p) {
      return { value: 'MultiModuleMiddlewares' };
    } else if (path.join('appPath', 'config/middleware.js') === p) {
      return { value: 'Middlewares' };
    }
  };

  instance.loadFiles = function(a, b) {
    depsCalledParams.push(a, b);
    return 'loadFiles call result';
  };

  instance.parse = function(e, f, g) {
    depsCalledParams.push(e, f, g);
    return 'parse call result';
  };

  return depsCalledParams;
}

function createInstance() {
  const Middleware = mock.reRequire('../../loader/middleware');
  return new Middleware();
}

function createTest1(isFile, modules, path) {
  return t => {
    var isFileParams = mockHelper(isFile);
    const instance = createInstance();
    const params = mockDeps(instance);

    const result = instance.load('appPath', modules, 'app');

    t.deepEqual(isFileParams, [path]);
    t.deepEqual(params, []);
    t.deepEqual(result, []);
  };
}
test('return [] when no middleware.js, isMultiModule = true',
  createTest1(false, ['admin'], path.join('appPath', 'common/config/middleware.js'))
);

test('return [] when no middleware.js, isMultiModule = false',
  createTest1(false, [], path.join('appPath', 'config/middleware.js'))
);

test('load middleware isMultiModule === true', t => {
  mockHelper(true);
  const instance = createInstance();
  const params = mockDeps(instance);

  const result = instance.load('appPath', ['admin'], 'app');

  t.deepEqual(params, [
    'appPath', 1,
    { value: 'MultiModuleMiddlewares' }, 'loadFiles call result', 'app'
  ]);

  t.is(result, 'parse call result');
});

test('load middleware isMultiModule === false', t => {
  mockHelper(true);
  const instance = createInstance();
  const params = mockDeps(instance);

  const result = instance.load('appPath', [], 'app');

  t.deepEqual(params, [
    'appPath', 0,
    { value: 'Middlewares' }, 'loadFiles call result', 'app'
  ]);

  t.is(result, 'parse call result');
});
