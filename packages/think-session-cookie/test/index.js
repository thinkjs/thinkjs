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

function getKeygrip() {
  return mock.reRequire('../keygrip');
}

const defaultCtx = {
  cookieStore: {
    test: JSON.stringify({data: {id: 1, value: 'test'}})
  },
  cookie(name,data){
    if(data == undefined){
      return this.cookieStore[name];
    }
    this.cookieStore[name] = data;
  },
  clear(){
    this.cookieStore = {
      test: JSON.stringify({data: {id: 1, value: 'test'}})
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

test('set/get function -- encrypt 1', async t => {
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

test('set/get function -- encrypt 2', async t => {
  const SessionCookie = getSessionCookie();
  const sc = new SessionCookie(undefined,defaultCtx);
  t.deepEqual(sc instanceof SessionCookie,true)
});

test('set/get function -- encrypt 3', t => {
  const keys = ['a', 'b'];
  const cpData = {id: 1, name: 'thinkjs'};
  const Keygrip = getKeygrip();
  const kg = new Keygrip(keys);
  const cpVal = kg.encrypt(JSON.stringify({data: cpData}))
  const ctx = {
    cookieStore: {
      test: cpVal
    },
    cookie(name, data){
      if (!data) {
        return this.cookieStore[name];
      }
      this.cookieStore[name] = data;
    },
  };
  const options = {
    name: 'test',
    encrypt: 'test',
    keys
  };
  const SessionCookie = getSessionCookie();
  const sc = new SessionCookie(options, ctx);
  t.deepEqual(sc.data, cpData);
});

test('set/get function -- encrypt', t => {
  const ctx = {
    cookieStore: {
      test: '0'
    },
    cookie(name, data){
      if (!data) {
        return this.cookieStore[name];
      }
      this.cookieStore[name] = data;
    },
  };
  const options = {
    name: 'test',
  };
  const SessionCookie = getSessionCookie();
  const sc = new SessionCookie(options, ctx);
  t.deepEqual(sc.data, {});
});

test('delete function', async t => {
  const options = {
    name: 'test',
  };
  const SessionCookie = getSessionCookie();
  const sc = new SessionCookie(options, defaultCtx);
  await sc.set('username','thinkjs');
  let val = await sc.get('username');

  t.deepEqual(val, 'thinkjs');
  await sc.delete();
  val = await sc.get('username');
  t.deepEqual(val, undefined);
});

test('delete function', async t => {
  const options = {
    name: 'test',
  };
  const SessionCookie = getSessionCookie();
  const sc = new SessionCookie(options, defaultCtx);
  await sc.set('username','thinkjs');
  let val = await sc.get('username');

  t.deepEqual(val, 'thinkjs');
  sc.fresh = true;
  await sc.delete();
  val = await sc.get('username');
  t.deepEqual(val, 'thinkjs');
});

test('encrypt function', t => {
  const crypto = require('crypto');
  const iv = crypto.randomBytes(16);
  const salt = "foobar";
  const hash = crypto.createHash("sha1");

  hash.update(salt);

  let key = hash.digest().slice(0, 16);

  const Keygrip = getKeygrip();
  const keys = ['a','b'];
  const kg = new Keygrip(keys);
  kg.cipher = 'aes-128-cbc';
  const data = JSON.stringify('a');
  let result = kg.encrypt(data,iv,key);

  t.deepEqual(result instanceof Buffer,true);
  let value = kg.decrypt(result,iv,key)
  t.deepEqual(value instanceof Buffer,true);
});