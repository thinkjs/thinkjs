const test = require('ava');
const path = require('path');
const mock = require('mock-require');

function mockHelper(isFile) {
  const helper = require('think-helper');
  var params = [];
  helper.isFile = function(f) {
    params.push(f);
    return isFile;
  }
  return params;
}

function mockUtil(multiModule, addNotAllow) {
  const util = require('../loader/util');
  util.interopRequire = function(p) {
    if(p === path.join('thinkPath', 'lib/config/extend.js')) {
      var ret = [{
        think: {a: 1},
      }];
      if(addNotAllow) {
        ret.push({notallow: {some: 'value'}});
      }
      return ret;
    } else if(p === path.join('appPath', multiModule ? 'common/config/extend.js' : 'config/extend.js')) {
      return [{
        context: {a: multiModule}
      }];
    } else if(p === path.join('thinkPath', 'lib/extend/think.js') ) {
      return {
        b: 2
      };
    } else if(p === path.join('thinkPath', 'lib/extend/context.js') ) {
      return {
        b: 2
      };
    } else if(p === path.join('appPath',
      (multiModule ? 'common/extend/think.js' : 'extend/think.js'))) {
      return {
        c: multiModule
      };
    } else if(p === path.join('appPath',
      (multiModule ? 'common/extend/context.js' : 'extend/context.js'))) {
      return {
        c: multiModule
      };
    } else {
      console.log('calsdjfkdsj k: ' + p);
    }
  }
}

function getLoader(a) {
  const extend = mock.reRequire('../loader/extend');
  extend.allowExtends = a;
  return extend.load;
}

function mockAssert() {
  var params = [];
  mock('assert', function(a,b) {
    params.push(a,b);
  });
  return params;
}

test('load multiple modules extend config', t=>{
  mockHelper(true);
  mockUtil(true);
  const load = getLoader(['think', 'context']);
  const ret = load('appPath', 'thinkPath', ['admin', 'user']);

  t.deepEqual(ret, {
    think: {a: 1, b: 2, c: true},
    context: {a: true, b: 2, c: true}
  });
});


test('load single modules extend config', t=>{
  mockHelper(true);
  mockUtil(false);
  const load = getLoader(['think', 'context']);
  const ret = load('appPath', 'thinkPath', []);

  t.deepEqual(ret, {
    think: {a: 1, b: 2, c: false},
    context: {a: false, b: 2, c: false}
  });
});

test('assert type must be one of allowExtends', t=>{
  mockHelper(true);
  mockUtil(false, true);
  var params = mockAssert();
  const load = getLoader(['think', 'context']);
  load('appPath', 'thinkPath', []);

  t.deepEqual(params.slice(2,4), [
    false,
    `extend type=notallow not allowed, allow types: ${['think','context'].join(', ')}`
  ]);
});