const test = require('ava');
const mock = require('mock-require');
const path = require('path');

var depsCalledParams;
function mockDeps() {
  if(!depsCalledParams) {
    depsCalledParams = []
    mock('../loader/config_load_config', function(a, b) {
      depsCalledParams.push(a, b);
      return {a: 'this will overwrite thinkconfig', b: 2, c: 3};
    });
    mock('../loader/config_load_adapter', function(c, d) {
      depsCalledParams.push(c, d);
      return 'adapter call result';
    });
    mock('../loader/config_format_adapter', function(e) {
      depsCalledParams.push(e);
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

test.beforeEach(t => {
    const fs = require('fs');
    fs.___readdirSync = fs.readdirSync;
    // This runs after each test and other test hooks, even if they failed
});

test('load config isMultiModule === true', t=>{
  const depsCalledParams = mockDeps();
  mockThinkConfig(t);

  const loadConfig = getConfig();
  var result = loadConfig('appPath', 'thinkPath', 'env', ['dir1', 'common']);

  let paths = [
    path.join('appPath', 'common'),
    path.join('appPath', 'dir1')
  ];
  t.deepEqual(depsCalledParams, [
    paths, 'env',  // loadConfig has been called with {paths, 'env'}
    paths, 'env',  // loadAdapter has been called with {paths, 'env'}
    'adapter call result' // formatAdapter has been called with 'adapter call result'
  ]);

  t.deepEqual(result.dir1, {
    thinkConfig: 'value of thinkConfig',
    a: 'this will overwrite thinkconfig', b: 2, c: 3,
    adapter: 'adapter'
  });
});

test('load config isMultiModule === false', t=>{
  const depsCalledParams = mockDeps();
  mockThinkConfig();

  const loadConfig = getConfig();
  const result = loadConfig('appPath', 'thinkPath', 'env', []);

  let paths = [path.join('appPath', 'config')];
  t.deepEqual(depsCalledParams, [
    paths, 'env',  // loadConfig has been called with {paths, 'env'}
    paths, 'env',  // loadAdapter has been called with {paths, 'env'}
    'adapter call result' // formatAdapter has been called with 'adapter call result'
  ]);

  t.deepEqual(result, {
    thinkConfig: 'value of thinkConfig',
    a: 'this will overwrite thinkconfig', b: 2, c: 3,
    adapter: 'adapter'
  });
});

test.afterEach.always(t => {
  const fs = require('fs');
  fs.readdirSync =fs.___readdirSync;
});
