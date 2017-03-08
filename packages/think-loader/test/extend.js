const test = require('ava');
const path = require('path');
const mock = require('mock-require');

function mockHelper(multiModule, isFile) {
  const helper = require('think-helper');
  var params = [];
  helper.isFile = function(p) {
    params.push(p);
    if(p === path.join('thinkPath', 'lib/config/extend.js')) {
      return isFile[0]
    } else if(p === path.join('appPath', multiModule ? 'common/config/extend.js' : 'config/extend.js')) {
      return isFile[1]
    } else if(p === path.join('thinkPath', 'lib/extend/think.js') ) {
      return isFile[2]
    } else if(p === path.join('thinkPath', 'lib/extend/context.js') ) {
      return isFile[3]
    } else if(p === path.join('appPath', (multiModule ? 'common/extend/think.js' : 'extend/think.js'))) {
      return isFile[4]
    } else if(p === path.join('appPath', (multiModule ? 'common/extend/context.js' : 'extend/context.js'))) {
      return isFile[5]
    } else {
      throw new Error();
    }
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
        context: {a: !!multiModule}
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
        c: !!multiModule
      };
    } else if(p === path.join('appPath',
      (multiModule ? 'common/extend/context.js' : 'extend/context.js'))) {
      return {
        c: !!multiModule
      };
    } else {
      throw new Error();
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

function createTest(modules, isFileArray, expectReturn) {
  return t=>{
    mockHelper(modules.length, isFileArray);
    mockUtil(modules.length);
    const load = getLoader(['think', 'context']);
    const ret = load('appPath', 'thinkPath', modules);
    t.deepEqual(ret, expectReturn);
  };
}

test('test1', createTest(
  ['admin', 'user'],
  [true, true, true, true, true, true],
  {
    think: {a: 1, b: 2, c: true},
    context: {a: true, b: 2, c: true}
  }
));

test('test2', createTest(
  [],
  [true, true, true, true, true, true],
  {
    think: {a: 1, b: 2, c: false},
    context: {a: false, b: 2, c: false}
  }
));

test('test3', createTest(
  [],
  [true, false, true, true, true, true],
  {
    think: {a: 1, b: 2, c: false},
    context: {b: 2, c: false}
  }
));

test('test4', createTest(
  [],
  [true, true, false, true, true, true],
  {
    think: {a: 1, c: false},
    context: {a: false, b: 2, c: false}
  }
));

test('test5', createTest(
  [],
  [true, true, true, false, true, true],
  {
    think: {a: 1, b: 2, c: false},
    context: {a: false, c: false}
  }
));

test('test6', createTest(
  [],
  [true, true, true, true, false, true],
  {
    think: {a: 1, b: 2},
    context: {a: false, b: 2, c: false}
  }
));

test('test7', createTest(
  [],
  [true, true, true, true, true, false],
  {
    think: {a: 1, b: 2, c: false},
    context: {a: false, b: 2}
  }
));

test('assert type must be one of allowExtends', t=>{
  mockHelper(false, [true, true, true, true, true, true]);
  mockUtil(false, true);
  var params = mockAssert();
  const load = getLoader(['think', 'context']);
  load('appPath', 'thinkPath', []);

  t.deepEqual(params.slice(2,4), [
    false,
    `extend type=notallow not allowed, allow types: ${['think','context'].join(', ')}`
  ]);
});