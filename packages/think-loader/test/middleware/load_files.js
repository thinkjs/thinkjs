const test = require('ava');
const path = require('path');
var callGetMidFilesParams;
function mockModule() {
  if(!callGetMidFilesParams) {
    callGetMidFilesParams = [];
    const mock = require('mock-require');
    mock('../../loader/middleware/get_files', function(a) {
      callGetMidFilesParams.push(a);
      return {[callGetMidFilesParams.length]: 'value'};
    });
  } else {
    callGetMidFilesParams.length = 0;
  }
  return callGetMidFilesParams;
}

function getInstance() {
  return require('../../loader/middleware/load_files');
}

test('getMiddlewareFiles isMultiModule === true', t=>{
  const params = mockModule();

  const loadMiddlewareFiles = getInstance();
  const result = loadMiddlewareFiles('appPath', true, 'thinkPath');
  t.deepEqual(params, [
    path.join('thinkPath', 'lib/middleware'),
    path.join('appPath', 'common/middleware')
  ]);

  t.deepEqual(result, {
    1: 'value',
    2: 'value'
  });
});

test('getMiddlewareFiles isMultiModule === false', t=>{
  const params = mockModule();

  const loadMiddlewareFiles = getInstance();
  const result = loadMiddlewareFiles('appPath', false, 'thinkPath');
  t.deepEqual(params, [
    path.join('thinkPath', 'lib/middleware'),
    path.join('appPath', 'middleware')
  ]);

  t.deepEqual(result, {
    1: 'value',
    2: 'value'
  });
});
