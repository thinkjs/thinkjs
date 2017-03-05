const test = require('ava');
const mock = require('mock-require');
const path = require('path');

var depsCalledParams;
function mockDeps() {
  if(!depsCalledParams) {
    depsCalledParams = []
    mock('../loader/config-load-config', function(a, b) {
      depsCalledParams.push(a, b);
      return {a: 'this will overwrite thinkconfig', b: 2, c: 3};
    });
    mock('../loader/config-load-adapter', function(c, d) {
      depsCalledParams.push(c, d);
      return 'adapter call result';
    });
    mock('../loader/config-format-adapter', function(e) {
      depsCalledParams.push(e);
      return {adapter: 'adapter'}
    });
  } else {
    depsCalledParams.length = 0;
  }

  return depsCalledParams;
}

function mockThinkConfig() {
  mock(path.join('thinkPath', 'config/config.js'), {
    thinkConfig: 'value of thinkConfig',
    a: 1 // will be overwrite
  });
}

function mockFsReaddirSync(t) {
  const fs = require('fs');
  fs.readdirSync = function(appPath) {
    t.is(appPath, 'appPath');
    return ['dir1', 'common']; // common will be ignore
  }
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
  mockThinkConfig();
  mockFsReaddirSync(t);

  const config = getConfig();
  var result = config.load('appPath', true, 'thinkPath', 'env');

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
  mockFsReaddirSync('appPath', t);


  const config = getConfig();
  const result = config.load('appPath', false, 'thinkPath', 'env');

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
