/*
* @Author: lushijie
* @Date:   2017-02-14 10:56:08
* @Last Modified by:   lushijie
* @Last Modified time: 2017-03-13 14:30:22
*/
import test from 'ava';
import helper from 'think-helper';
import path from 'path';
import assert from 'assert';
import njk from 'nunjucks';
import Nunjucks from '../index.js';

const defaultOptions = {
  autoescape: true,
  watch: false,
  noCache: false,
  throwOnUndefined: false
};
let shortenFn = str =>{
  return str.slice(0, 5);
};
const viewPath = path.join(__dirname, 'views');
const viewData = {title: 'thinkjs'};
njk.configure(path.join(__dirname, 'views'), defaultOptions);
let resp1 = njk.render('home.njk', viewData);

test.serial('nunjucks absolute path', async t => {
  let nunjucks = new Nunjucks('./home.njk', viewData, {viewPath: viewPath});
  let ret = await nunjucks.render();

  t.is(ret, resp1);
});

test.serial('nunjucks not in absolute path', async t => {
  let nunjucks = new Nunjucks(path.join(viewPath, 'home.njk'), viewData, {viewPath: '/User/lushijie/home/'});
  let ret = await nunjucks.render();

  t.is(ret, resp1);
});

test.serial('nunjucks releative path', async t => {
  let nunjucks = new Nunjucks('./home.njk', viewData, {viewPath: viewPath});
  let ret = await nunjucks.render();

  t.is(ret, resp1);
});

test.serial('nunjucks beforeRender', async t => {
  let nunjucks = new Nunjucks('./admin.njk', viewData, {
    viewPath: path.join(__dirname, 'views'),
    beforeRender: function(env, nunjucks, config) {
      env.addFilter('shorten', shortenFn);
    }
  });
  let ret = await nunjucks.render();
  var env = new njk.Environment(new njk.FileSystemLoader(path.join(__dirname, 'views')), defaultOptions);
  env.addFilter('shorten', shortenFn);
  let resp2 = env.render('admin.njk', viewData);

  t.is(ret, resp2);
});

test.serial('nunjucks file not found cause reject', async t => {
  let nunjucks = new Nunjucks('./error.njk', viewData, {viewPath: viewPath});
  try {
    let ret = await nunjucks.render();
  }catch(e) {
    t.pass();
  }
});
