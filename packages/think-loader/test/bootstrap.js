const test = require('ava');
const path = require('path');

test('bootstrapPath when isMultiModule is true', t=>{
  const bootstrap  = require('../loader/bootstrap');
  const helper = require('think-helper');
  const mock = require('mock-require');

  const bootstrapPath = path.join('app', 'common/bootstrap');
  const ajs = path.join(bootstrapPath, 'a.js');
  const bjs = path.join(bootstrapPath, 'b.js');
  mock(ajs, {__name: 'ajs'});
  mock(bjs, {__name: 'bjs'});
  helper.getdirFiles = function(dir) {
    t.is(dir, bootstrapPath);
    return ['a.js', 'b.js', 'c.css', 'd.config', 'e.js.etc'];
  }

  var modules = bootstrap('app', ['admin']);
  t.is(modules[0].__name, 'ajs');
  t.is(modules[1].__name, 'bjs');
  t.is(modules.length, 2);
});


test('bootstrapPath when isMultiModule is false', t=>{
  const bootstrap  = require('../loader/bootstrap');
  const helper = require('think-helper');
  const mock = require('mock-require');

  const bootstrapPath = path.join('app', 'bootstrap');
  const ajs = path.join(bootstrapPath, 'a.js');
  const bjs = path.join(bootstrapPath, 'b.js');
  mock(ajs, {__name: 'ajs'});
  mock(bjs, {__name: 'bjs'});
  helper.getdirFiles = function(dir) {
    t.is(dir, bootstrapPath);
    return ['a.js', 'b.js', 'c.css', 'd.config', 'e.js.etc'];
  }

  var modules = bootstrap('app', []);
  t.is(modules[0].__name, 'ajs');
  t.is(modules[1].__name, 'bjs');
  t.is(modules.length, 2);
});