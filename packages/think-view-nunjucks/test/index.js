/*
* @Author: lushijie
* @Date:   2017-02-14 10:56:08
* @Last Modified by:   lushijie
* @Last Modified time: 2017-03-27 17:16:32
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
const viewBasePath = path.join(__dirname, 'views');
const viewData = {title: 'thinkjs'};
njk.configure(path.join(__dirname, 'views'), defaultOptions);
let resp1 = njk.render('home.njk', viewData);

test.serial('nunjucks absolute path', async t => {
  let viewFile = path.join(viewBasePath, 'home.njk');
  let nunjucks = new Nunjucks(viewFile, viewData, {viewPath: viewBasePath});
  let ret = await nunjucks.render();

  t.is(ret, resp1);
});

test.serial('nunjucks not in absolute path', async t => {
  let nunjucks = new Nunjucks(path.join(viewBasePath, 'home.njk'), viewData, {viewPath: '/User/lushijie/home/'});
  let ret = await nunjucks.render();

  t.is(ret, resp1);
});

test.serial('nunjucks releative path', async t => {
  let viewFile = path.join(viewBasePath, 'home.njk');
  let nunjucks = new Nunjucks(viewFile, viewData, {viewPath: viewBasePath});
  let ret = await nunjucks.render();

  t.is(ret, resp1);
});

test.serial('nunjucks beforeRender', async t => {
  let shortenFn = str =>{
    return str.slice(0, 5);
  };
  let viewFile = path.join(viewBasePath, 'admin.njk');
  let nunjucks = new Nunjucks(viewFile, viewData, {
    viewPath: viewBasePath,
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
  let viewFile = path.join(viewBasePath, 'error.njk');
  let nunjucks = new Nunjucks(viewFile, viewData, {viewPath: viewBasePath});
  try {
    let ret = await nunjucks.render();
  }catch(e) {
    t.pass();
  }
});
