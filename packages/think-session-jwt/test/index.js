import test from 'ava';
import mock from 'mock-require';
import jwt from 'jsonwebtoken';

const cookieName = ['red_skull', 'norman_osborn', 'loki', 'magneto', 'dr_doom', 'thor'];
const cookieStore = {};
const headerStore = {};
const postData = {};

function mockRequire() {
  return mock.reRequire('../');
}

function mockContext() {
  return {
    set: function(obj) {
      for (const [key, value] of Object.entries(obj)) {
        headerStore[key] = value;
      }
    },
    headers: {},
    query: {},
    post: function(name) {
      if (name) return postData[name];
      return postData;
    },
    cookie: function(name, data, options) {
      if (data) {
        cookieStore[name] = data;
      } else {
        return cookieStore[name];
      }
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

    const options1 = {
      name: cookieName[0],
      secret: 'secret'
    };
    const jwtSession1 = new JWTSession(options1, ctx);
    await jwtSession1.delete();

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

test.serial('5.getType and setType both are header', t => {
  return new Promise(async function(resolve, reject) {
    const JWTSession = mockRequire();
    const ctx = mockContext();
    const options = {
      secret: 'secret',
      getType: 'header',
      setType: 'header'
    };
    ctx.headers['jwt'] = jwt.sign({}, 'secret');
    const jwtSession = new JWTSession(options, ctx);
    await jwtSession.set('abc', '123');

    t.deepEqual(jwtSession.data, {
      abc: '123'
    });

    const token = headerStore['x-jwt-token'];
    t.is(typeof token, 'string');

    await jwtSession.delete();
    resolve();
  });
});

test.serial('6.getType is query', t => {
  return new Promise(async function(resolve, reject) {
    const JWTSession = mockRequire();
    const ctx = mockContext();
    const options = {
      name: cookieName[4],
      secret: 'secret',
      getType: 'query'
    };
    const jwtSession = new JWTSession(options, ctx);
    await jwtSession.set('abc', '123');

    t.deepEqual(jwtSession.data, {
      abc: '123'
    });

    const token = ctx.cookie(options.name);
    t.is(typeof token, 'string');
    resolve();
  });
});

test.serial('7.getType is request body', t => {
  return new Promise(async function(resolve, reject) {
    const JWTSession = mockRequire();
    const ctx = mockContext();
    const options = {
      name: cookieName[5],
      secret: 'secret',
      getType: 'body'
    };
    const jwtSession = new JWTSession(options, ctx);
    await jwtSession.set('abc', '123');

    t.deepEqual(jwtSession.data, {
      abc: '123'
    });

    const token = ctx.cookie(options.name);
    t.is(typeof token, 'string');
    resolve();
  });
});
