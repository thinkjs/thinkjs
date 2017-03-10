/*
* @Author: lushijie
* @Date:   2017-02-14 10:56:08
* @Last Modified by:   lushijie
* @Last Modified time: 2017-03-10 19:14:25
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
}
njk.configure(path.join(__dirname, 'views'), defaultOptions);
let resp1 = njk.render('home.njk', {title: 'thinkjs'});

var env = new njk.Environment(new njk.FileSystemLoader(path.join(__dirname, 'views')), defaultOptions);
env.addFilter('shorten', function(str) {
  return str.slice(0, 5);
});
let resp2 = env.render('admin.njk', {title: 'thinkjs'});

const viewPath = path.join(__dirname, 'views');

// test case
test.serial('nunjucks absolute path', async t => {
  let nunjucks = new Nunjucks('/Users/lushijie/github/think-view-nunjucks/test/views/home.njk', {title: 'thinkjs'}, {viewPath: viewPath});
  let ret = await nunjucks.run();
  t.is(ret, resp1);
});

test.serial('nunjucks not in absolute path', async t => {
  let nunjucks = new Nunjucks('/Users/lushijie/github/think-view-nunjucks/test/views/home.njk', {title: 'thinkjs'}, {viewPath: '/User/name'});
  let ret = await nunjucks.run();
  t.is(ret, resp1);
});

test.serial('nunjucks releative path', async t => {
  let nunjucks = new Nunjucks('./home.njk', {title: 'thinkjs'}, {viewPath: viewPath});
  let ret = await nunjucks.run();
  t.is(ret, resp1);
});

test.serial('nunjucks beforeRender', async t => {
  let nunjucks = new Nunjucks('./admin.njk', {title: 'thinkjs'}, {
    viewPath: path.join(__dirname, 'views'),
    beforeRender: function(config, nunjucks, env) {
      env.addFilter('shorten', function(str) {
        return str.slice(0, 5);
      });
    }
  });
  let ret = await nunjucks.run();
  t.is(ret, resp2);
});

test.serial('nunjucks reject', async t => {
  let nunjucks = new Nunjucks('./error.njk', {title: 'thinkjs'}, {viewPath: viewPath});
  try {
    let ret = await nunjucks.run();
  }catch(e) {
    t.pass();
  }
});


