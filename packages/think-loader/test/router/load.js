const test = require('ava');
const mock = require('mock-require');
const path = require('path');

// function createLoader(modules = 'modules') {
//   const Loader = mock.reRequire('../../index.js');
//   var loader = new Loader('appPath', 'thinkpath');
//   loader.modules = modules;
//   return loader;
// }

const paths = [
  path.join('appPath', 'common/config/router.js'),
  path.join('appPath', 'user', 'config/router.js'),
  path.join('appPath', 'admin', 'config/router.js'),
  path.join('appPath', 'config/router.js')
];

function mockHelper(isFiles) {
  const helper = require('think-helper');
  helper.isFile = function(p) {
    if (paths[0] === p) {
      return isFiles[0];
    }
    if (paths[1] === p) {
      return isFiles[1];
    }
    if (paths[2] === p) {
      return isFiles[2];
    }
    if (paths[3] === p) {
      return isFiles[3];
    }
  };
}

function getRouter() {
  return mock.reRequire('../../loader/router.js');
}

function mockFormatRouter(router) {
  const params = [];
  router.formatRouter = function(p) {
    params.push(p);
    return 'formatRouter result';
  };
  return params;
}

function mockUtil(contents) {
  const util = require('../../loader/util');
  util.interopRequire = function(p) {
    if (paths[0] === p) {
      return contents[0];
    }
    if (paths[1] === p) {
      return contents[1];
    }
    if (paths[2] === p) {
      return contents[2];
    }
    if (paths[3] === p) {
      return contents[3];
    }
  };
}

function createTest(modules, isFiles, fileContents,
 formatRouterCallParams, expectResult, expectAssertParams = []) {
  return t => {
    var assertParams = [];
    mock('assert', function(a, b) {
      assertParams.push(a, b);
    });
    mockHelper(isFiles);
    mockUtil(fileContents);
    var router = getRouter();
    var params = mockFormatRouter(router);

    var result = router.load('appPath', modules);

    if (expectAssertParams.length === 0) {
      t.deepEqual(params, formatRouterCallParams);
      t.deepEqual(result, expectResult);
    } else {
      t.deepEqual(assertParams, expectAssertParams);
    }
  };
}

// const handle = function() {};

test('test1', createTest(
  ['admin', 'user'],
  [true, true, true, true],
  [],
  [],
  undefined
));

// test('test1 when router is function ', createTest(
//   ['admin', 'user'],
//   [true, true, true, true],
//   [handle],
//   [handle],
//   'formatRouter result'
// ));

// test('test2', createTest(
//   ['admin', 'user'],
//   [false, true, true, true],
//   [[1,2,3]],
//   [],
//   []
// ));

// test('test3', createTest(
//   ['admin', 'user'],
//   [true, false, true, true],
//   [{user: {match: /^usermatch(?:\/(?=$))?$/i, rules: []}, admin: {match: /^adminmatch(?:\/(?=$))?$/i, rules: []}}, undefined, 'adminFileContent'],
//   ['adminFileContent'],
//   {admin: {match: /^adminmatch(?:\/(?=$))?$/i, rules: 'formatRouter result'}, user: {match: /^usermatch(?:\/(?=$))?$/i, rules: []}}
// ));

// test('test4', createTest(
//   ['admin', 'user'],
//   [true, false, false, true],
//   [{user: {match: /^usermatch(?:\/(?=$))?$/i, rules: []}, admin: {match: /^adminmatch(?:\/(?=$))?$/i, rules: []}}, undefined, undefined],
//   [],
//   {admin: {match: /^adminmatch(?:\/(?=$))?$/i, rules: []}, user: {match: /^usermatch(?:\/(?=$))?$/i, rules: []}}
// ));

// test('test5', createTest(
//   ['admin', 'user'],
//   [true, true, true, true],
//   [{user: {match: /^usermatch(?:\/(?=$))?$/i, rules: []}, admin: {match: /^adminmatch(?:\/(?=$))?$/i, rules: []}}, 'userFile', 'adminFile'],
//   ['userFile', 'adminFile'],
//   {admin: {match: /^adminmatch(?:\/(?=$))?$/i, rules: 'formatRouter result'}, user: {match: /^usermatch(?:\/(?=$))?$/i, rules: 'formatRouter result'}}
// ));

// test('assert when router config is object, each name should be an object and has match filed',
//   createTest(
//   ['admin', 'user'],
//   [true, true, true, true],
//   [{user: {}, admin: {match: /^usermatch(?:\/(?=$))?$/i}}, 'userFile', 'adminFile'],
//   ['userFile', 'adminFile'], // there are asserts, ignore
//   {admin: {match: /^usermatch(?:\/(?=$))?$/i, rules: 'formatRouter result'}, user: {rules: 'formatRouter result'}},
// ));

// test('test6', createTest(
//   [], // single module
//   [true, true, true, false],
//   [null, null, null, null],
//   [], // formatRouter call params
//   [], // result
// ));

// test('test7', createTest(
//   [], // single module
//   [true, true, true, true],
//   [null, null, null, []],
//   [[]], // formatRouter call params
//   'formatRouter result', // result
// ));

// test('test8', createTest(
//   [], // single module
//   [true, true, true, true],
//   [null, null, null, handle],
//   [handle], // formatRouter call params
//   'formatRouter result', // result
// ));

// test('assert single module, router config must be function or array', createTest(
//   [], // single module
//   [true, true, true, true],
//   [null, null, null, {}],
//   undefined, // there are asserts, ignore
//   undefined, // there are asserts, ignore
//   [false, 'config/router must be an array or a function']
// ));
