const test = require('ava');
const path = require('path');
const mock = require('mock-require');

function getCommon() {
  const common = require('../loader/common.js');
  return common;
}

function mockLoadFiles() {
  var callParams = [];
  getCommon().loadFiles = function(dir) {
    callParams.push(dir);
    return {
      a: 1,
      b: 2
    };
  }
  return callParams;
}

test('common loader when isMultiModule is true', t=>{
  const params = mockLoadFiles();
  const common = getCommon();

  var cache = common.load('appPath', 'type', ['user', 'admin', 'other']);

  t.deepEqual(params, [
    path.join('appPath', 'user', 'type'),
    path.join('appPath', 'admin', 'type'),
    path.join('appPath', 'other', 'type')
  ]);

  t.is(cache[path.join('user', 'a')], 1);
  t.is(cache[path.join('user', 'b')], 2);
  t.is(cache[path.join('admin', 'a')], 1);
  t.is(cache[path.join('admin', 'b')], 2);
  t.is(cache[path.join('other', 'a')], 1);
  t.is(cache[path.join('other', 'b')], 2);
});

test('common.load when isMultiModule is false', t=>{
  const params = mockLoadFiles();
  const common = getCommon();

  var cache = common.load('appPath', 'type', []);

  t.deepEqual(params, [
    path.join('appPath', 'type')
  ]);

  t.deepEqual(cache, {a: 1, b: 2});
});
