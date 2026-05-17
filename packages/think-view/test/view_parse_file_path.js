const test = require('ava');
const mock = require('mock-require');

const ctx = {
  module: 'admin',
  controller: 'user',
  action: 'index',
};

const config = {
  sep: '/',
  extname: '.html',
  viewPath: '/www/static'
};

function getView() {
  return mock.reRequire('../lib/view');
}

function mockAssert(assertCallParams = []) {
  mock('assert', (type, desc) => {
    assertCallParams.push(type, desc);
  });
}

test('parseFilePath function -- normal scene', t => {
  const View = getView();
  const view = new View(ctx);
  let file = view.parseFilePath('index.html', config);
  t.is(file, '/www/static/index.html');
});

test('parseFilePath function -- path without extension name', t => {
  const View = getView();
  const view = new View(ctx);
  let file = view.parseFilePath('index', config);
  t.is(file, '/www/static/index.html');
});

test('parseFilePath function -- undefined path', t => {
  const View = getView();
  const view = new View(ctx);
  let file = view.parseFilePath(undefined, config);
  t.is(file, '/www/static/admin/user/index.html');
});

test('parseFilePath function -- absolute path', t => {
  const View = getView();
  const view = new View(ctx);
  let file = view.parseFilePath('/index.html', config);
  t.is(file, '/index.html');
});

test('parseFilePath function -- ctx.module undefined', t => {
  let assertCallParams = [];
  mockAssert(assertCallParams);
  const View = getView();
  const errCtx = {
    controller: 'user',
    action: 'index'
  };
  const view = new View(errCtx);
  let file = undefined;
  t.throws(() => {
    file = view.parseFilePath(file, config);
  }, Error);
  t.deepEqual(
    assertCallParams,
    [
      'user',
      'ctx.controller required',
      'index',
      'ctx.action required',
      '/',
      'config.sep required'
    ]
  );
});

test('parseFilePath function -- ctx.controller undefined', t => {
  let assertCallParams = [];
  mockAssert(assertCallParams);
  const View = getView();
  const errCtx = {
    module: 'user',
    action: 'index'
  };
  const view = new View(errCtx);
  let file = undefined;
  view.parseFilePath(file, config);
  t.deepEqual(
    assertCallParams,
    [
      undefined,
      'ctx.controller required',
      'index',
      'ctx.action required',
      '/',
      'config.sep required',
      '.html',
      'config.extname required',
      true,
      'config.viewPath required an absolute path'
    ]
  );
});

test('parseFilePath function -- ctx.action undefined', t => {
  let assertCallParams = [];
  mockAssert(assertCallParams);
  const View = getView();
  const errCtx = {
    module: 'user',
    controller: 'index'
  };
  const view = new View(errCtx);
  let file = undefined;
  view.parseFilePath(file, config);
  t.deepEqual(
    assertCallParams,
    [
      'index',
      'ctx.controller required',
      undefined,
      'ctx.action required',
      '/',
      'config.sep required',
      '.html',
      'config.extname required',
      true,
      'config.viewPath required an absolute path'
    ]
  );
});

test('parseFilePath function -- empty config ', t => {
  let assertCallParams = [];
  mockAssert(assertCallParams);
  const View = getView();
  const view = new View(ctx);
  let file = undefined;
  t.throws(() => {
    file = view.parseFilePath(file);
  }, Error);
  t.deepEqual(
    assertCallParams,
    [
      'user',
      'ctx.controller required',
      'index',
      'ctx.action required',
      undefined,
      'config.sep required',
      undefined,
      'config.extname required',
      undefined,
      'config.viewPath required an absolute path'
    ]
  );
});
