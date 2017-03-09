const test = require('ava');
const mock = require('mock-require');

function getView() {
  return mock.reRequire('../lib/view');
}

class Nunjucks {
  constructor(file, viewData, config) {
    this.file = file;
    this.viewData = viewData;
    this.config = config;
  }
  run(){

  }
}
function getConfig(){
  return {
    sep: '/',
    extname: '.html',
    viewPath: 'www/static',
    handle: Nunjucks
  }
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

test('render function -- delete config.handle', t => {
  const View = getView();
  const view = new View(ctx);
  const file = 'index.html';
  let config = getConfig();
  view.render(file,config);
  t.is(config.handle,undefined);
});