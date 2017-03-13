const test = require('ava');
const path = require('path');

function mockHelper(isFile) {
  const helper = require('think-helper');

  helper.isFile = function(filepath) {
    return isFile;
  }
}

function getInstance() {
  const config = require('../loader/config');
  return new config();
}

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
  const instance = getInstance();
  var config = {};
  instance.loadConfigByName(config, ['path1', 'path2', 'path3'], 'config');

  t.deepEqual(config, {a:1, b:2, c:3});
});

test('if isFile === false, load nothing', t=>{
  var isFile = false;
  mockFiles();
  mockHelper(isFile);
  const instance = getInstance();
  var config = {};

  instance.loadConfigByName(config, ['path1', 'path2', 'path3'], 'config');

  t.deepEqual(config, {});
});