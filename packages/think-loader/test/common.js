import test from 'ava';
import path from 'path';

function mockHelper(t, dir) {
  var helper = require('think-helper');
  helper.getdirFiles = function(d) {
    t.is(d, dir);
    return ['a.js', 'b.js', 'c.css', 'd.config', 'e.js.etc'];
  }
}

function mockModule(dir) {
  const mock = require('mock-require');
  const ajs = path.join(dir, 'a.js');
  const bjs = path.join(dir, 'b.js');
  mock(ajs, {__name: 'ajs'});
  mock(bjs, {__name: 'bjs'});
  return {ajs, bjs};
}

test.beforeEach(t => {
    const fs = require('fs');
    fs.___readdirSync = fs.readdirSync;
    fs.___statSync = fs.statSync;
    // This runs after each test and other test hooks, even if they failed
});

test('common.loadFiles', t=>{
  const loadFiles = require('../loader/common').loadFiles;
  const dir = 'dir';
  mockModule(dir);
  mockHelper(t, dir);
  var cache = loadFiles(dir);
  t.is(cache.a.__name, 'ajs');
  t.is(cache.b.__name, 'bjs');
});



test('common.load when isMultiModule is true', t=>{

  // mock fs
  const fs = require('fs');
  fs.readdirSync= function(p){
    t.is(p, 'apppath');
    return ['user', 'admin', 'other'];
  };
  fs.statSync = function(p) {
    return {
      isDirectory() {
        if(path.join('apppath', 'user') === p) {
          return true;
        }
        return false;
      }
    }
  }
  const dir = path.join('apppath', 'user', 'type');
  mockModule(dir);
  mockHelper(t, dir);
  const common = require('../loader/common');

  var cache = common.load('apppath', true, 'type');

  t.is(cache[path.join('user', 'a')].__name, 'ajs');
  t.is(cache[path.join('user', 'b')].__name, 'bjs');
});


test.afterEach.always(t => {
  const fs = require('fs');
  fs.readdirSync =fs.___readdirSync;
  fs.statSync = fs.___statSync;
});
