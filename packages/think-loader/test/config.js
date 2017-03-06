const test = require('ava');
const mock = require('mock-require');
const path = require('path');

var depsCalledParams;
function mockDeps() {
  if(!depsCalledParams) {
    depsCalledParams = [];
    mock('../loader/config_load_config', function(a, b, c) {
      depsCalledParams.push(a, b, c);
      if(c === 'adapter') {
        return 'load adapter config result';
      }
      return {a: 'this will overwrite thinkconfig', b: 2, c: 3};
    });
    mock('../loader/config_load_adapter', function(c) {
      depsCalledParams.push(c);
      return 'load adapter result';
    });
    mock('../loader/config_format_adapter', function(e, f) {
      depsCalledParams.push(e, f);
      return {adapter: 'adapter'}
    });
  } else {
    depsCalledParams.length = 0;
  }

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
  return require('../loader/config');
}

test('load config isMultiModule === true', t=>{
  let depsCalledParams = mockDeps();
  mockThinkConfig(t);

  const loadConfig = getConfig();
  var result = loadConfig('appPath', 'thinkPath', 'env', ['dir1', 'common']);

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
    'load adapter config result', 'load adapter result', // formatAdapter has been called with 'adapter call result'

    paths2, 'env', undefined,  // loadConfig has been called with {paths, 'env'}
    paths2, 'env', 'adapter',  // loadConfig adapter
    path.join('appPath', 'common/adapter'), // loadAdapter                             // loadAdapter config has been called with {paths, 'env'}
    'load adapter config result', 'load adapter result' // formatAdapter has been called with 'adapter call result'
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
  let depsCalledParams = mockDeps();
  mockThinkConfig(t);

  const loadConfig = getConfig();
  const result = loadConfig('appPath', 'thinkPath', 'env', []);

  let paths = [path.join('appPath', 'config')];
  t.deepEqual(depsCalledParams, [
    paths, 'env', undefined,  // loadConfig has been called with {paths, 'env'}
    paths, 'env', 'adapter',  // loadConfig adapter
    path.join('appPath', 'adapter'), // loadAdapter                             // loadAdapter config has been called with {paths, 'env'}
    'load adapter config result', 'load adapter result' // formatAdapter has been called with 'adapter call result'
  ]);

  t.deepEqual(result, {
    thinkConfig: 'value of thinkConfig',
    a: 'this will overwrite thinkconfig', b: 2, c: 3,
    adapter: 'adapter'
  });
});

