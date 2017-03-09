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
  viewPath: 'www/static'
};

test.beforeEach(t => {
  mockAssert();
});

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
  t.is(file, 'www/static/index.html');
});

test('parseFilePath function -- path without extension name', t => {
  const View = getView();
  const view = new View(ctx);
  let file = view.parseFilePath('index', config);
  t.is(file, 'www/static/index.html');
});

test('parseFilePath function -- Object path', t => {
  const View = getView();
  const view = new View(ctx);
  let file = view.parseFilePath({}, config);
  t.is(file, 'www/static/admin/user/index.html');
});

test('parseFilePath function -- undefined path', t => {
  const View = getView();
  const view = new View(ctx);
  let file = view.parseFilePath(undefined, config);
  t.is(file, 'www/static/admin/user/index.html');
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
  t.is(file, undefined);
  t.deepEqual(
    assertCallParams,
    [
      undefined,
      'ctx.module required',
      'user',
      'ctx.controller required',
      'index',
      'ctx.action required',
      '/',
      'config.sep required'
    ]
  );
});