const test = require('ava');
const mock = require('mock-require');
const path = require('path');

function mockHelper(isFile) {
  var params = [];
  const helper = require('think-helper');
  helper.isFile = (p)=>{
    params.push(p);
    return isFile
  };
  return params;
}

var depsCalledParams;
function mockDeps() {
  if(!depsCalledParams) {
    depsCalledParams = [];
    mock('../../loader/util.js', {interopRequire(p){
      if(path.join('appPath', 'common/config/middleware.js') === p) {
        return {value: 'MultiModuleMiddlewares'};
      } else if(path.join('appPath', 'config/middleware.js') === p) {
        return {value: 'Middlewares'}
      }
    }});

    mock('../../loader/middleware/load_files', function(a, b, c) {
      depsCalledParams.push(a, b, c);
      return 'loadMiddlewareFiles call result';
    });

    mock('../../loader/middleware/parse', function(e, f) {
      depsCalledParams.push(e, f);
      return 'parseMiddleware call result';
    });
  } else {
    depsCalledParams.length = 0;
  }

  return depsCalledParams;
}

function createInstance() {
  return require('../../loader/middleware/loader');
}

function createTest1(isFile, modules, path) {
  return t=>{
    var isFileParams = mockHelper(isFile);
    const params = mockDeps();
    const loadMiddleware = createInstance();

    const result = loadMiddleware('appPath', 'thinkPath', modules);

    t.deepEqual(isFileParams, [path]);
    t.deepEqual(params, []);
    t.deepEqual(result, []);
  }
}
test('return [] when no middleware.js, isMultiModule = true',
 createTest1(false, ['admin'], path.join('appPath', 'common/config/middleware.js'))
);

test('return [] when no middleware.js, isMultiModule = false',
 createTest1(false, [], path.join('appPath', 'config/middleware.js'))
);

test('load middleware isMultiModule === true', t=>{
  mockHelper(true);
  const params = mockDeps();
  const loadMiddleware = createInstance();

  const result = loadMiddleware('appPath', 'thinkPath', ['admin']);

  t.deepEqual(params, [
    'appPath', 1, 'thinkPath',
    {value: 'MultiModuleMiddlewares'}, 'loadMiddlewareFiles call result'
  ]);

  t.is(result, 'parseMiddleware call result');
});

test('load middleware isMultiModule === false', t=>{
  mockHelper(true);
  const params = mockDeps();
  const loadMiddleware = createInstance();

  const result = loadMiddleware('appPath', 'thinkPath', []);

  t.deepEqual(params, [
    'appPath', 0, 'thinkPath',
    {value: 'Middlewares'}, 'loadMiddlewareFiles call result'
  ]);

  t.is(result, 'parseMiddleware call result');
});
