const test = require('ava');
const path = require('path');

test('bootstrapPath when isMultiModule is true', t=>{
  const bootstrap  = require('../loader/bootstrap');
  const helper = require('think-helper');
  const mock = require('mock-require');

  const bootstrapPath = path.join('app', 'common/bootstrap');
  const ajs = path.join(bootstrapPath, 'worker.js');
  mock(ajs, {__name: 'ajs'});
  helper.isFile = function(dir) {
    return true;
  }

  var modules = bootstrap('app', ['admin'], 'worker');
  t.is(modules.__name, 'ajs');
});


test('bootstrapPath when isMultiModule is false', t=>{
  const bootstrap  = require('../loader/bootstrap');
  const helper = require('think-helper');
  const mock = require('mock-require');

  const bootstrapPath = path.join('app', 'bootstrap');
  const ajs = path.join(bootstrapPath, 'master.js');
  mock(ajs, {__name: 'master'});
  helper.isFile = function(dir) {
    return true;
  }

  var modules = bootstrap('app', [], 'master');
  t.is(modules.__name, 'master');
});