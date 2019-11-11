const test = require('ava');
const mock = require('mock-require');
const path = require('path');

// var depsCalledParams;
function mockDeps(instance) {
  var depsCalledParams = [];
  instance.loadConfig = function(a, b, c) {
    depsCalledParams.push(a, b, c);
    if (c === 'adapter') {
      return { type: 'load adapter' };
    }
    return { a: 'this will overwrite thinkconfig', b: 2, c: 3 };
  };
  instance.loadAdapter = function(c) {
    depsCalledParams.push(c);
    return 'load adapter result';
  };

  instance.formatAdapter = function(e, f) {
    depsCalledParams.push(e, f);
    return { adapter: 'adapter' };
  };

  return depsCalledParams;
}

function mockThinkConfig() {
  mock('thinkjs/lib/config/config', {
    thinkConfig: 'value of thinkConfig',
    a: 1 // will be overwrite
  });
}

function getConfig() {
  const Config = mock.reRequire('../loader/config');
  return new Config();
}

test('load config isMultiModule === true', t => {
  mockThinkConfig();
  const instance = getConfig();
  const depsCalledParams = mockDeps(instance);
  var result = instance.load('appPath', 'env', ['dir1', 'common']);

  var extendParams1 = [
    'appPath/common/config',
    'appPath/dir1/config'
  ].map(p => path.join(p));

  var extendParams2 = extendParams1.slice(0, 1);

  t.deepEqual(depsCalledParams, [
    extendParams1,
    'env',
    'config',
    extendParams1,
    'env',
    'adapter',
    path.join('appPath/common/adapter'),
    { type: 'load adapter' },
    'load adapter result',
    extendParams2,
    'env',
    'config',
    extendParams2,
    'env',
    'adapter',
    path.join('appPath/common/adapter'),
    { type: 'load adapter' },
    'load adapter result']);

  const expect = {
    thinkConfig: 'value of thinkConfig',
    a: 'this will overwrite thinkconfig',
    b: 2,
    c: 3,
    adapter: 'adapter'
  };

  t.deepEqual(result.dir1, expect);

  t.deepEqual(result.common, expect);
});

test('load config isMultiModule === false', t => {
  mockThinkConfig();

  const instance = getConfig();
  const depsCalledParams = mockDeps(instance);
  const result = instance.load('appPath', 'env', []);

  const paths = [path.join('appPath', 'config')];
  t.deepEqual(depsCalledParams, [
    paths, 'env', 'config', // loadConfig has been called with {paths, 'env'}
    paths, 'env', 'adapter', // loadConfig adapter
    path.join('appPath', 'adapter'), // loadAdapter                             // loadAdapter config has been called with {paths, 'env'}
    { type: 'load adapter' }, 'load adapter result' // formatAdapter has been called with 'adapter call result'
  ]);

  t.deepEqual(result, {
    thinkConfig: 'value of thinkConfig',
    a: 'this will overwrite thinkconfig',
    b: 2,
    c: 3,
    adapter: 'adapter'
  });
});
