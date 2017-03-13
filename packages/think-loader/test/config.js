const test = require('ava');
const mock = require('mock-require');
const path = require('path');

var depsCalledParams;
function mockDeps(instance) {
  var depsCalledParams = [];
  instance.loadConfig = function(a, b, c) {
    depsCalledParams.push(a, b, c);
    if(c === 'adapter') {
      return {type: 'load adapter'};
    }
    return {a: 'this will overwrite thinkconfig', b: 2, c: 3};
  };
  instance.loadAdapter = function(c) {
    depsCalledParams.push(c);
    return 'load adapter result';
  };

  instance.formatAdapter =  function(e, f) {
    depsCalledParams.push(e, f);
    return {adapter: 'adapter'}
  };

  return depsCalledParams;
}

function mockThinkConfig(t) {
  mock('../loader/util.js', {interopRequire(p){
    t.is(p, path.join('thinkPath', 'lib/config/config.js'));
    return {
      thinkConfig: 'value of thinkConfig',
      a: 1 // will be overwrite
    };
  }})
}

function getConfig() {
  const config = mock.reRequire('../loader/config');
  return new config();
}

test('load config isMultiModule === true', t=>{
  mockThinkConfig(t);

  const instance = getConfig();
  let depsCalledParams = mockDeps(instance);
  var result = instance.load('appPath', 'thinkPath', 'env', ['dir1', 'common']);

  let paths = [
    path.join('appPath', 'common'),
    path.join('appPath', 'dir1')
  ];

  let paths2 = [
    path.join('appPath', 'common')
  ];

  t.deepEqual(depsCalledParams, [
    paths, 'env', undefined,  // loadConfig has been called with {paths, 'env'}
    paths, 'env', 'adapter',  // loadConfig adapter
    path.join('appPath', 'common/adapter'), // loadAdapter                             // loadAdapter config has been called with {paths, 'env'}
    {type: 'load adapter'}, 'load adapter result', // formatAdapter has been called with 'adapter call result'

    paths2, 'env', undefined,  // loadConfig has been called with {paths, 'env'}
    paths2, 'env', 'adapter',  // loadConfig adapter
    path.join('appPath', 'common/adapter'), // loadAdapter                             // loadAdapter config has been called with {paths, 'env'}
    {type: 'load adapter'}, 'load adapter result' // formatAdapter has been called with 'adapter call result'
  ]);

  const expect = {
    thinkConfig: 'value of thinkConfig',
    a: 'this will overwrite thinkconfig', b: 2, c: 3,
    adapter: 'adapter'
  }

  t.deepEqual(result.dir1, expect);

  t.deepEqual(result.common, expect);
});

test('load config isMultiModule === false', t=>{
  mockThinkConfig(t);

  const instance = getConfig();
  let depsCalledParams = mockDeps(instance);
  const result = instance.load('appPath', 'thinkPath', 'env', []);

  let paths = [path.join('appPath', 'config')];
  t.deepEqual(depsCalledParams, [
    paths, 'env', undefined,  // loadConfig has been called with {paths, 'env'}
    [path.join('thinkPath', 'lib/config')], 'env', 'adapter',  // loadConfig thinkAdapterConfig
    paths, 'env', 'adapter',  // loadConfig adapter
    path.join('appPath', 'adapter'), // loadAdapter                             // loadAdapter config has been called with {paths, 'env'}
    {type: 'load adapter'}, 'load adapter result' // formatAdapter has been called with 'adapter call result'
  ]);

  t.deepEqual(result, {
    type: 'load adapter',
    thinkConfig: 'value of thinkConfig',
    a: 'this will overwrite thinkconfig', b: 2, c: 3,
    adapter: 'adapter'
  });
});

