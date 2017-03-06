const test = require('ava');

function mockHelper(isFile) {
  const helper = require('think-helper');

  helper.isFile = function(filepath) {
    return isFile;
  }
}
const path = require('path');
function mockFiles() {
  const mock = require('mock-require');
  mock(path.join('path1', 'config'), {a: 1});
  mock(path.join('path2', 'config'), {b: 2});
  mock(path.join('path3', 'config'), {c: 3});
}

test('foreach configPaths load all file and merge into config object', t=>{
  var isFile = true;
  mockFiles();
  mockHelper(isFile);
  const loadConfigByName = require('../loader/config_load_config_by_name');
  var config = {};

  loadConfigByName(config, ['path1', 'path2', 'path3'], 'config');

  t.deepEqual(config, {a:1, b:2, c:3});
});

test('if isFile === false, load nothing', t=>{
  var isFile = false;
  mockFiles();
  mockHelper(isFile);
  const loadConfigByName = require('../loader/config_load_config_by_name');
  var config = {};

  loadConfigByName(config, ['path1', 'path2', 'path3'], 'config');

  t.deepEqual(config, {});
});