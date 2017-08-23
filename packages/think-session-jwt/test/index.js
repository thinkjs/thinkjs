import test from 'ava';
import mock from 'mock-require';
import jwt from 'jsonwebtoken';

const cookieName = ['red_skull', 'norman_osborn', 'loki', 'magneto', 'dr_doom'];
const cookieStore = {};
const headerStore = {};

function mockRequire() {
  return mock.reRequire('../');
}

function mockContext() {
  return {
    get: function(name) {
      return headerStore[name];
    },
    set: function(obj) {
      for (const [key, value] of Object.entries(obj)) {
        headerStore[key] = value;
      }
    },
    cookie: function(name, data, options) {
      if (data) {
        cookieStore[name] = data;
      }
      return cookieStore[name];
    }
  };
}

function sleep(dur = 100) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, dur);
  });
}

function mockDebug(param = []) {
  const debug1 = str => err => param.push(err);
  mock('debug', debug1);
}

test.serial('1.options without jwt secret', t => {
  return new Promise(async function(resolve, reject) {
    const JWTSession = mockRequire();
    const ctx = mockContext();
    const options = {
      name: cookieName[0]
    };
    const error = t.throws(() => {
      // eslint-disable-next-line no-unused-vars
      const jwtSession = new JWTSession(options, ctx);
    });
    t.is(error.message, 'jwt secret is required');

    resolve();
  });
});

test.serial('2.set and get session data without maxAge', t => {
  return new Promise(async function(resolve, reject) {
    const JWTSession = mockRequire();
    const ctx = mockContext();
    const options = {
      name: cookieName[1],
      secret: 'secret'
    };
    const jwtSession = new JWTSession(options, ctx);
    await jwtSession.set('abc', '123');
    t.deepEqual(jwtSession.data, {
      abc: '123'
    });

    await jwtSession.set();
    t.deepEqual(jwtSession.data, {
      abc: '123'
    });

    const value = await jwtSession.get('abc');
    t.is(value, '123');

    const value1 = await jwtSession.get();
    t.deepEqual(value1, { abc: '123' });

    await jwtSession.delete();
    t.deepEqual(jwtSession.data, {});

    resolve();
  });
});

test.serial('3.set and get session data with maxAge', t => {
  return new Promise(async function(resolve, reject) {
    const JWTSession = mockRequire();
    const ctx = mockContext();
    const options = {
      name: cookieName[2],
      secret: 'secret',
      maxAge: 1000,
      autoUpdate: true
    };

    ctx.cookie(options.name, jwt.sign({}, 'secret'));
    const jwtSession = new JWTSession(options, ctx);
    await jwtSession.set('abc', '123');
    t.deepEqual(jwtSession.data, {
      'abc': '123'
    });

    const value = await jwtSession.get('abc');
    t.is(value, '123');

    await sleep(1100);

    const jwtSession1 = new JWTSession(options, ctx);
    const value1 = await jwtSession1.get('abc');
    t.is(value1, undefined);

    resolve();
  });
});

test.serial('4.set and get session data when JsonWebTokenError', t => {
  return new Promise(async function(resolve, reject) {
    const JWTSession = mockRequire();
    const ctx = mockContext();
    const debugParam = [];
    mockDebug(debugParam);

    const options = {
      name: cookieName[3],
      secret: 'secret'
    };

    ctx.cookie(options.name, 'gg');
    const jwtSession = new JWTSession(options, ctx);
    await jwtSession.set('abc', '123');

    t.is(debugParam.length, 0);
    resolve();
  });
});

test.serial('5.set and get session date tokenType is header', t => {
  return new Promise(async function(resolve, reject) {
    const JWTSession = mockRequire();
    const ctx = mockContext();
    const options = {
      secret: 'secret',
      tokenType: 'header'
    };
    const jwtSession = new JWTSession(options, ctx);
    await jwtSession.set('abc', '123');

    t.deepEqual(jwtSession.data, {
      abc: '123'
    });

    resolve();
  });
});
