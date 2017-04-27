const test = require('ava');
const mock = require('mock-require');

function getCrontab() {
  return mock.reRequire('../index');
}

function mockAssert(assertCallParams = []) {
  mock('assert', (type, desc) => {
    assertCallParams.push(type, desc);
  });
}

test('constructor function', t => {
});