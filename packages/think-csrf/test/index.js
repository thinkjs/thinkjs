const path = require('path');
const test = require('ava');
const request = require('supertest');
const helper = require('think-helper');
const Koa = require('koa');
const app = new Koa();

// Simulation execution environment
test.before(t => {
  const payload = require('think-payload');
  const session = require('think-session');
  const fileSession = require('think-session-file');
  const csrf = require('../lib/csrf.js');

  const sessionConfig = {
    type: 'file',
    file: {
      handle: fileSession,
      sessionPath: path.join(__dirname, 'session')
    }
  };

  const cookieData = {};


  const _ctx = {
    config(key){
      switch(key) {
        case 'session': 
          return sessionConfig;
        case 'cookie': 
          return sessionConfig;
      }
    },

    cookie: function cookie(key, value, options) {
      if(key && value === undefined) return cookieData[key];
     
      if(key && value) {
        return cookieData[key] = value;
      }
    }
  };

  app.use(function (ctx, next) {
    const _session = session.context.session.bind(Object.assign(ctx, _ctx));
    ctx.session = function (name, value) {
      return _session.call({ctx}, name, value);
    }
    return next();
  });
  app.use(payload());
  app.use(csrf({form_name: '_csrf_'})); // Test options
  app.use(function (ctx, next) {
    const method = ctx.method;
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS' || method === 'TRACE') {
      ctx.body = ctx.csrf;
    } else {
      ctx.body = 'ok';
    }
  });
});

test.cb('should return token', t => {
  request(app.callback())
  .get('/')
  .set('Content-Type', 'text/plain')
  .expect(200)
  .end((err, res) => {
    t.is(typeof res.text, 'string');
    t.end();
  });
});

test.cb('should intercept request', t => {
  request(app.callback())
  .post('/')
  .set('Content-Type', 'text/plain')
  .expect(200)
  .end((err, res) => {
    t.is(res.status, 403)
    t.is(res.text, 'invalid csrf token');
    t.end();
  });
});

test('should not being intercepted 1', async t => {
  const agent = request.agent(app.callback());

  const res = await agent
  .get('/')
  .expect(200);

  const token = res.text;

  const result = await agent
  .post('/')
  .send({_csrf_: token})
  .expect(200);

  t.is(result.text, 'ok');
});

test('should not being intercepted 2', async t => {
  const agent = request.agent(app.callback());

  const res = await agent
  .get('/')
  .expect(200);

  const token = res.text;

  const result = await agent
  .post('/')
  .set('x-csrf-token', token)
  .expect(200);

  t.is(result.text, 'ok');
});

test.after(t => {
  helper.rmdir(path.join(__dirname, 'session'));
});