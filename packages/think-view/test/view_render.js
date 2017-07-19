const test = require('ava');
const mock = require('mock-require');
const helper = require('think-helper');

function getView() {
  return mock.reRequire('../lib/view');
}

class Nunjucks {
  constructor(file, viewData, config) {
    this.file = file;
    this.viewData = viewData;
    this.config = config;
  }

  render() {

  }
}

function getConfig() {
  return {
    sep: '/',
    extname: '.html',
    viewPath: '/www/static',
    handle: Nunjucks
  }
}

function mockAssert(assertCallParams = []) {
  mock('assert', (type, desc) => {
    assertCallParams.push(type, desc);
  });
}

const ctx = {
  module: 'admin',
  controller: 'user',
  action: 'index',
};

test('render function -- normal scene', t => {
  const View = getView();
  const view = new View(ctx);
  const file = 'index.html';
  let promise = view.render(file,getConfig());
  t.not(promise.then,undefined);
});


test('render function -- beforeRender', t => {
  const View = getView();
  const view = new View(ctx);
  const file = 'index.html';
  let config = helper.extend({}, getConfig(), {beforeRender: function() {}});
  let promise = view.render(file,config);
  t.not(promise.then,undefined);
});

// test('render function -- delete config.handle', t => {
//   const View = getView();
//   const view = new View(ctx);
//   const file = 'index.html';
//   let config = getConfig();
//   view.render(file,config);
//   t.is(config.handle,undefined);
// });

test('render function -- empty config', t => {
  let assertCallParams = [];
  mockAssert(assertCallParams);
  const View = getView();
  const view = new View(ctx);
  const file = 'index.html';
  t.throws(() => {
    view.render(file);
  }, Error);
  t.deepEqual(
    assertCallParams,
    [
      false,
      'config.handle must be a function',
      undefined,
      'config.viewPath required an absolute path'
    ]
  );
});
