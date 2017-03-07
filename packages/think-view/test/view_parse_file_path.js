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

// test('parseFilePath function -- Object path', t=> {
//   const view = new View(ctx);
//   let file = view.parseFilePath({}, config);
//   console.log(file);
// });

test('parseFilePath function -- path without extension name', t=> {
  const view = new View(ctx);
  let file = view.parseFilePath('index', config);
  t.is(file, 'www/static/index.html');
});


test('parseFilePath function -- undefined path', t=> {
  const view = new View(ctx);
  let file = view.parseFilePath(undefined, config);
  t.is(file, 'www/static/admin/user/index.html');
});

test('parseFilePath function -- absolute path', t=> {
  const view = new View(ctx);
  let file = view.parseFilePath('/index.html', config);
  t.is(file, '/index.html');
});