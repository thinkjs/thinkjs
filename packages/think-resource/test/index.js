'use strict';

const Koa = require('koa');
const test = require('ava');
const serve = require('..');
const request = require('supertest');
const _ = require('lodash');

function createServer (options, middlewares = [], callback) {
  const app = new Koa();
  if (_.isFunction(middlewares)) {
    callback = middlewares;
    middlewares = [];
  }
  if (!_.isArray(middlewares)) {
    middlewares = [];
  }
  middlewares.unshift(serve(options));
  middlewares.forEach(middleware => {
    app.use(middleware);
  });
  return app.listen(function () {
    if (_.isFunction(callback)) {
      callback(this);
    }
  });
}

test.cb('serve by root:"."', t => {
  t.plan(1);
  request(createServer({ root: '.' }))
    .get('/package.json')
    .expect(200, (err, res) => {
      if (err) {
        t.fail();
      }
      else {
        t.pass();
      }
      t.end();
    });
});

test.cb('serve by path:"not a file"', t => {
  t.plan(1);
  request(createServer({ root: 'test/assets' }))
    .get('/errpath.txt')
    .expect(404, (err, res) => {
      if (err) {
        t.fail();
      }
      else {
        t.pass();
      }
      t.end();
    });
});

test.cb('serve by valid path', t => {
  t.plan(1)
  request(createServer({ root: 'test/assets' }))
    .get('/1.txt')
    .expect(200)
    .expect('txt hello', (err, res) => {
      if (err) {
        t.fail();
      }
      else {
        t.pass();
      }
      t.end();
    });
});

test.cb('serve by upstream middleware responds', t => {
  t.plan(1);
  request(createServer({ root: 'test/assets' }, [ (ctx, next) => {
    return next().then(() => {
      ctx.body = 'hi';
    });
  } ]))
    .get('/1.txt')
    .expect(200)
    .expect('txt hello', (err, res) => {
      if (err) {
        t.fail();
      }
      else {
        t.pass();
      }
      t.end();
    });
});

test.cb('serve by index', t => {
  t.plan(1);
  request(createServer({ root: 'test/assets', index: 'index.txt' }))
    .get('/')
    .expect(200)
    .expect('Content-Type', 'text/plain; charset=utf-8')
    .expect('index', (err, res) => {
      if (err) {
        t.fail();
      }
      else {
        t.pass();
      }
      t.end();
    });
});

test.cb('serve by index html', t => {
  t.plan(1);
  request(createServer({ root: 'test/assets' }))
    .get('/html/')
    .expect(200)
    .expect('Content-Type', 'text/html; charset=utf-8')
    .expect('index html world', (err, res) => {
      if (err) {
        t.fail();
      }
      else {
        t.pass();
      }
      t.end();
    });
});

test.cb('serve by disabled index', t => {
  t.plan(1);
  request(createServer({ root: 'test/assets', index: false }))
    .get('/html/')
    .expect(404, (err, res) => {
      if (err) {
        t.fail();
      }
      else {
        t.pass();
      }
      t.end();
    });
});

test.cb('serve by POST method', t => {
  t.plan(1);
  request(createServer({ root: 'test/assets' }))
    .post('/1.txt')
    .expect(404, (err, res) => {
      if (err) {
        t.fail();
      }
      else {
        t.pass();
      }
      t.end();
    });
});

