const test = require('ava');
const View = require('../lib/view');

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

test('parseFilePath function -- normal scene', t=> {
  const view = new View(ctx);
  let file = view.parseFilePath('index.html', config);
  t.is(file, 'www/static/index.html');
});
