'use strict';

const Koa = require('koa');
const assert = require('node:assert/strict');
const {test, before, after, afterEach} = require('node:test');
const serve = require('..');
const request = require('supertest');
const helper = require('think-helper');
const fs = require('fs');
const os = require('os');
const path = require('path');

const extensionRoot = path.join(os.tmpdir(), `think-resource-assets-${process.pid}`);
const servers = new Set();
before(() => fs.cpSync(path.join(__dirname, 'assets'), extensionRoot, {recursive: true}));
afterEach(async () => {
  await Promise.all([...servers].map(server => new Promise((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
  })));
  servers.clear();
});
after(() => fs.rmSync(extensionRoot, {force: true, recursive: true}));

function createServer (options, middlewares = [], callback) {
  const app = new Koa();
  if (helper.isFunction(middlewares)) {
    callback = middlewares;
    middlewares = [];
  }
  if (!helper.isArray(middlewares)) {
    middlewares = [];
  }
  middlewares.unshift(serve(options));
  middlewares.forEach(middleware => {
    app.use(middleware);
  });
  const server = app.listen(function () {
    if (helper.isFunction(callback)) {
      callback(this);
    }
  });
  servers.add(server);
  return server;
}

test('serve by no options"."', () => {
  assert.throws(() => createServer(), /root directory is required to serve files/);
});

test('serve by root:"."', async t => {
  await request(createServer({ root: '.' }))
    .get('/package.json')
    .expect(200);
  assert.ok(true);
});

test('serve by path:"not a file"', async t => {
  await request(createServer({ root: 'test/assets' }))
    .get('/errpath.txt')
    .expect(404);
  assert.ok(true);
});

test('serve by invalid path', async t => {
  await request(createServer({ root: 'test/assets' }))
    .get('/%fdsa')
    .expect(400);
  assert.ok(true);
});

test('serve by valid path', async t => {
  await request(createServer({ root: 'test/assets' }))
    .get('/1.txt')
    .expect(200)
    .expect('txt hello');
  assert.ok(true);
});

test('serve by upstream middleware responds', async t => {
  await request(createServer({ root: 'test/assets' }, [ (ctx, next) => {
    return next().then(() => {
      ctx.body = 'hi';
    });
  } ]))
    .get('/1.txt')
    .expect(200)
    .expect('txt hello');
  assert.ok(true);
});

test('serve by index', async t => {
  await request(createServer({ root: 'test/assets', index: 'index.txt' }))
    .get('/')
    .expect(200)
    .expect('Content-Type', 'text/plain; charset=utf-8')
    .expect('index');
  assert.ok(true);
});

test('serve by index html', async t => {
  await request(createServer({ root: 'test/assets' }))
    .get('/html/')
    .expect(200)
    .expect('Content-Type', 'text/html; charset=utf-8')
    .expect('index html world');
  assert.ok(true);
});

test('serve by disabled index', async t => {
  await request(createServer({ root: 'test/assets', index: false }))
    .get('/html/')
    .expect(404);
  assert.ok(true);
});

test('serve by POST method', async t => {
  await request(createServer({ root: 'test/assets' }))
    .post('/1.txt')
    .expect(404);
  assert.ok(true);
});

test('serve by publicPath', async t => {
  await request(createServer({ root: 'test/assets', publicPath: '/1.txt' }))
    .get('/1.txt')
    .expect(200);
  assert.ok(true);
});

test('serve by publicPath #2', async t => {
  await request(createServer({ root: 'test/assets', publicPath: /1\.txt/ }))
    .get('/1.txt')
    .expect(200);
  assert.ok(true);
});

test('serve by publicPath #3', async t => {
  await request(createServer({ root: 'test/assets', publicPath: /^\/html\/index.html/ }))
    .get('/html/index.html')
    .expect(200);
  assert.ok(true);
});

test('serve by publicPath #4', async t => {
  await request(createServer({ root: 'test/assets', publicPath: '1.txt' }))
    .get('/1.txt')
    .expect(200);
  assert.ok(true);
});

test('serve by format:"true"', async t => {
  await request(createServer({ root: 'test/assets', format: true }))
    .get('/html')
    .expect(200);
  assert.ok(true);
});


test('serve by format:"false"', async t => {
  await request(createServer({ root: 'test/assets', format: false }))
    .get('/html')
    .expect(404);
  assert.ok(true);
});

test('serve by setHeaders:"true"', async t => {
  await request(createServer({ root: 'test/assets', setHeaders: true }))
    .get('/html')
    .expect(500);
  assert.ok(true);
});

test('serve by gzip', async t => {
  await request(createServer({ root: 'test/assets', gzip: true }))
    .get('/gzip.json')
    .expect(200);
  assert.ok(true);
});

test('serve by extensions', async t => {
  await request(createServer({ root: extensionRoot, extensions: ['.html', 'txt'] }))
    .get('/index')
    .expect(200);
  assert.ok(true);
});

test('serve by extensions fail', async t => {
  await request(createServer({ root: extensionRoot, extensions: ['txt'] }))
    .get('/test')
    .expect(404);
  assert.ok(true);
});

test('serve by extensions err', async t => {
  await request(createServer({ root: extensionRoot, extensions: [2, {}, []] }))
    .get('/index')
    .expect(500);
  assert.ok(true);
});

test('serve by hidden file', async t => {
  await request(createServer({ root: 'test/assets', hidden: true }))
    .get('/.hidden')
    .expect(200);
  assert.ok(true);
});

test('serve by hidden file #2', async t => {
  await request(createServer({ root: 'test/assets', hidden: false }))
    .get('/.hidden')
    .expect(404);
  assert.ok(true);
});

test('serve by notFoundNext', async t => {
  await request(createServer({ root: 'test/assets', notFoundNext: true }))
    .get('/1.txt')
    .expect(200)
    .expect('txt hello');
  assert.ok(true);
});

test('serve by notFoundNext #2', async t => {
  await request(createServer({ root: 'test/assets', notFoundNext: true }))
    .get('/1.txt1')
    .expect(404);
  assert.ok(true);
});
