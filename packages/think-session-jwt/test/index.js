import test from 'ava';
import mock from 'mock-require';
import jwt from 'jsonwebtoken';

const cookieName = [
  'red_skull',
  'norman_osborn',
  'loki',
  'magneto',
  'dr_doom',
  'thor'
];
const cookieStore = {};
const postData = {};

function mockRequire() {
  return mock.reRequire('../');
}

function mockContext() {
  return {
    headers: {},
    query: {},
    post: function(name) {
      if (name) return postData[name];
      return postData;
    },
    cookie: function(name, data) {
      if (data) {
        cookieStore[name] = data;
      } else {
        return cookieStore[name];
      }
    }
  };
}

async function sleep(dur = 100) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, dur);
  });
}

test.serial('1.options without jwt secret', t => {
  return new Promise(async function(resolve, reject) {
    const JWTSession = mockRequire();
    const ctx = mockContext();
    const options = {
      tokenName: cookieName[0]
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
      tokenName: cookieName[1],
      secret: 'secret'
    };

    ctx.cookie(options.tokenName, jwt.sign({ abc: '123' }, 'secret'));
    const jwtSession = new JWTSession(options, ctx);
    await jwtSession.set('abc', '123');
    t.is(jwtSession.data.abc, '123');

    await jwtSession.set();
    t.is(jwtSession.data.abc, '123');

    const value = await jwtSession.get('abc');
    t.is(value, '123');

    const value1 = await jwtSession.get();
    delete value1.iat;
    delete value1.exp;
    t.deepEqual(value1, { abc: '123' });

    await jwtSession.delete();
    t.deepEqual(jwtSession.data, {});

    const options1 = {
      tokenName: cookieName[0],
      secret: 'secret'
    };
    const jwtSession1 = new JWTSession(options1, ctx);
    await jwtSession1.delete();

    resolve();
  });
});

test.serial('3.set and get session data with maxAge', async t => {
  return new Promise(async function(resolve, reject) {
    const JWTSession = mockRequire();
    const ctx = mockContext();
    const options = {
      tokenName: cookieName[2],
      secret: 'secret',
      sign: {
        expiresIn: '1s'
      }
    };

    ctx.cookie(options.tokenName, jwt.sign({ abc: '123' }, 'secret'));
    const jwtSession = new JWTSession(options, ctx);

    const token = await jwtSession.set('abc', '123');
    t.is(jwtSession.data.abc, '123');

    const value = await jwtSession.get('abc');
    t.is(value, '123');

    ctx.cookie(options.tokenName, token);
    await sleep(1100);

    const jwtSession1 = new JWTSession(options, ctx);
    const data = await jwtSession1.get();
    t.is(data.name, 'TokenExpiredError');
    t.is(data.message, 'jwt expired');
    resolve();
  });
});

test.serial('4.set and get session data when JsonWebTokenError', t => {
  return new Promise(async function(resolve, reject) {
    const JWTSession = mockRequire();
    const ctx = mockContext();

    const options = {
      secret: 'secret'
    };

    ctx.cookie('jwt', 'gg');
    const jwtSession = new JWTSession(options, ctx);

    const data = await jwtSession.get();
    t.is(data.name, 'JsonWebTokenError');
    t.is(data.message, 'jwt malformed');

    const jwtSession1 = new JWTSession(options, ctx);
    jwtSession1.data = undefined;

    const token = jwt.sign({}, options.secret);
    const data1 = await jwtSession1.set();
    t.deepEqual(data1, token);

    resolve();
  });
});

test.serial('5.get jwt from request header', t => {
  return new Promise(async function(resolve, reject) {
    const JWTSession = mockRequire();
    const ctx = mockContext();
    const options = {
      secret: 'secret',
      tokenType: 'header'
    };

    ctx.headers['jwt'] = jwt.sign({}, 'secret');
    const jwtSession = new JWTSession(options, ctx);
    const token = await jwtSession.set('abc', '123');

    t.is(jwtSession.data.abc, '123');

    t.is(typeof token, 'string');

    await jwtSession.delete();
    resolve();
  });
});

test.serial('6.get jwt from query', t => {
  return new Promise(async function(resolve, reject) {
    const JWTSession = mockRequire();
    const ctx = mockContext();
    const options = {
      secret: 'secret',
      tokenType: 'query'
    };

    const jwtSession = new JWTSession(options, ctx);
    const token = await jwtSession.set('abc', '123');

    t.is(jwtSession.data.abc, '123');

    t.is(typeof token, 'string');
    resolve();
  });
});

test.serial('7.get jwt from request body', t => {
  return new Promise(async function(resolve, reject) {
    const JWTSession = mockRequire();
    const ctx = mockContext();
    const options = {
      secret: 'secret',
      tokenType: 'body'
    };

    const jwtSession = new JWTSession(options, ctx);
    const token = await jwtSession.set('abc', '123');

    t.is(jwtSession.data.abc, '123');

    t.is(typeof token, 'string');
    resolve();
  });
});
