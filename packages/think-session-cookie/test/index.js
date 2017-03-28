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

const defaultCtx = {
  cookieStore: {
    test: JSON.stringify({id: 1, value: 'test'})
  },
  cookie(name){
    return this.cookieStore[name];
  }
};

test('constructor function -- option.encrypt with empty keys', t => {
  let assertCallParams = [];
  mockAssert(assertCallParams);
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
      '.keys required and must be an array when encrypt is set'
    ]
  )
});

test('constructor function -- option.encrypt with not array keys', t => {
  let assertCallParams = [];
  mockAssert(assertCallParams);
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
      '.keys required and must be an array when encrypt is set'
    ]
  )
});


test('initSessionData function -- get empty session data', t => {
  const options = {
    name: 'cookie_name'
  };
  const SessionCookie = getSessionCookie();

  const sc = new SessionCookie(options, defaultCtx);

  t.deepEqual(sc.data, {});
});

test('initSessionData function -- get empty session data', t => {
  const options = {
    name: 'test'
  };
  const SessionCookie = getSessionCookie();

  const sc = new SessionCookie(options, defaultCtx);

  t.deepEqual(sc.data, {id: 1, value: 'test'});
  t.deepEqual(sc.fresh, false);
});


































