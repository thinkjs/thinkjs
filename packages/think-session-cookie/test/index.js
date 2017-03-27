const test = require('ava');
const mock = require('mock-require');

function getSessionCookie() {
  return mock.reRequire('../index');
}

function mockAssert(assertCallParams = []) {
  mock('assert', (type, desc) => {
    assertCallParams.push(type, desc);
    throw new Error("this is an assert failed signal");
  });
}

function mockKeygrip() {
  mock('./keygrip', () => {});
}

const defaultCtx = {
  cookie:(name)=>{
    return name;
  }
};

test('constructor function -- option.encrypt with empty keys', t => {
  let assertCallParams = [];
  mockAssert(assertCallParams);
  mockKeygrip();
  const options = {
    encrypt: 'test',
    name:'cookie_name'
  };
  const SessionCookie = getSessionCookie();

  t.throws(() => {
    new SessionCookie(options, defaultCtx);
  }, Error);

  t.deepEqual(assertCallParams,
    [
      undefined,
      '.keys required when encrypt is set'
    ]
  )
});

test('constructor function -- option.encrypt with not array keys', t => {
  let assertCallParams = [];
  mockAssert(assertCallParams);
  mockKeygrip();
  const options = {
    encrypt: 'test',
    name:'cookie_name'
  };
  const SessionCookie = getSessionCookie();

  t.throws(() => {
    new SessionCookie(options, defaultCtx);
  }, Error);

  t.deepEqual(assertCallParams,
    [
      undefined,
      '.keys required when encrypt is set'
    ]
  )
});