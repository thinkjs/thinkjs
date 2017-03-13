const test = require('ava');
const path = require('path');
var callGetMidFilesParams;
function mockGetFiles(instance) {
  callGetMidFilesParams = [];
  instance.getFiles = function(a) {
    callGetMidFilesParams.push(a);
    return {[callGetMidFilesParams.length]: 'value'};
  };
  return callGetMidFilesParams;
}

function getInstance() {
  const middleware = require('../../loader/middleware');
  return new middleware();
}

test('loadFiles isMultiModule === true', t=>{
  const middleware = getInstance();
  const params = mockGetFiles(middleware);
  const result = middleware.loadFiles('appPath', true, 'thinkPath');
  t.deepEqual(params, [
    path.join('thinkPath', 'lib/middleware'),
    path.join('appPath', 'common/middleware')
  ]);

  t.deepEqual(result, {
    1: 'value',
    2: 'value'
  });
});

test('loadFiles isMultiModule === false', t=>{
  const middleware = getInstance();
  const params = mockGetFiles(middleware);
  const result = middleware.loadFiles('appPath', false, 'thinkPath');
  t.deepEqual(params, [
    path.join('thinkPath', 'lib/middleware'),
    path.join('appPath', 'middleware')
  ]);

  t.deepEqual(result, {
    1: 'value',
    2: 'value'
  });
});
