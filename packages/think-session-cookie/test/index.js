const test = require('ava');
const mock = require('mock-require');

function mockAssert(assertCallParams = []) {
  mock('assert', (type, desc) => {
    assertCallParams.push(type, desc);
    if(!type){
      throw new Error("this is an assert failed signal");
    }
  });
}

function getSessionCookie() {
  return mock.reRequire('../index');
}

const defaultCtx = {
  cookieStore: {
    test: JSON.stringify({id: 1, value: 'test'})
  },
  cookie(name,data){
    if(!data){
      return this.cookieStore[name];
    }
    this.cookieStore[name] = data;
  },
  clear(){
    this.cookieStore = {
      test: JSON.stringify({id: 1, value: 'test'})
    };
  }
};

test.afterEach.always(_ => {
  mock.stop('assert');
  defaultCtx.clear();
});

test('constructor function -- option.encrypt with empty keys', t => {
  let assertCallParams = [];
  mockAssert(assertCallParams);
  const options = {
    encrypt: 'test',
    name: 'cookie_name'
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
    name: 'cookie_name'
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

test('set/get function -- normal scene', async t => {
  const options = {
    name: 'test'
  };

  const SessionCookie = getSessionCookie();
  const sc = new SessionCookie(options, defaultCtx);
  await sc.set('username', 'thinkjs');
  let value = await sc.get('username');

  t.deepEqual(value, 'thinkjs');

});

test('set/get function -- encrypt', async t => {
  const options = {
    name: 'test',
    encrypt: 'test',
    keys: ['a', 'b']
  };
  const SessionCookie = getSessionCookie();
  const sc = new SessionCookie(options, defaultCtx);
  await sc.set('username', 'thinkjs');
  let value = await sc.get('username');

  t.deepEqual(value, 'thinkjs');
});

test('get function -- autoUpdate && maxAge name', async t => {
  const options = {
    name: 'test',
    encrypt: 'test',
    keys: ['a', 'b'],
    autoUpdate: true,
    maxAge: 30000
  };
  const ctx = {
    cookieStore: {},
    cookie(name,data){
      if(!data){
        return this.cookieStore[name];
      }
      if(options && options.autoUpdate && options.maxAge){
        this.cookieStore = {};
        return this.cookieStore;
      }
      this.cookieStore[name] = data;
    }
  };
  const SessionCookie = getSessionCookie();
  const sc = new SessionCookie(options, ctx);

  sc.fresh = false;
  const result = await sc.get();
  t.deepEqual(result, {});
});



























