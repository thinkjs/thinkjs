/*
* @Author: lushijie
* @Date:   2017-02-14 10:56:08
* @Last Modified by:   lushijie
* @Last Modified time: 2017-03-27 17:05:37
*/
import test from 'ava';
import helper from 'think-helper';
import path from 'path';
import fs from 'fs';
import handlebarsOrigin from 'handlebars';
import Handlebars from '../index.js';

let viewBasePath = path.join(__dirname, 'views');
let defaultOptions = {
  compat: true,
  strict: false,
  preventIndent: true,
  ignoreStandalone: true,
  cache: false
};
let viewData = {title: 'Thinkjs'};

// test case
test.serial('handlebars default render', async t => {
  let viewFile = path.join(viewBasePath, './home.tpl');
  let config = helper.extend({}, defaultOptions, {viewPath: viewBasePath});
  let handlebars = new Handlebars(viewFile, viewData, config);
  let fileContent = fs.readFileSync(path.join(viewBasePath, 'home.tpl')).toString();
  let originResp = handlebarsOrigin.compile(fileContent)(viewData);

  t.is(originResp, await handlebars.render())
});

test.serial('handlebars with absolute path', async t => {
  let config = helper.extend({}, defaultOptions, {viewPath: viewBasePath});
  let handlebars = new Handlebars(path.join(viewBasePath, './home.tpl'), viewData, config);
  let fileContent = fs.readFileSync(path.join(viewBasePath, 'home.tpl')).toString();
  let originResp = handlebarsOrigin.compile(fileContent)(viewData);

  t.is(originResp, await handlebars.render());
});

test.serial('get content err', async t => {
  let config = helper.extend({}, defaultOptions, {viewPath: viewBasePath});
  let handlebars = new Handlebars(path.join(viewBasePath, './noExit.tpl'), viewData, config);
  try {
    let ret = await handlebars.render();
    console.log(ret);
  }catch(e) {
    t.pass();
  }
});

test.serial('handlebars with cache', async t => {
  let config = helper.extend({}, defaultOptions, {viewPath: viewBasePath, cache: true});
  let handlebars = new Handlebars(path.join(viewBasePath, './home.tpl'), viewData, config);

  t.is(await handlebars.render(), await handlebars.render());
});

test.serial('handlebars with registerHelper', async t => {
  let shortenFn = str => {
    return str.slice(0, 5);
  };
  let config = helper.extend({}, defaultOptions, {
    viewPath: viewBasePath,
    beforeRender: (handlebars, config) => {
      handlebars.registerHelper('shorten', shortenFn);
    }
  });
  let viewFile = path.join(viewBasePath, './admin.tpl');
  let handlebars = new Handlebars(viewFile, viewData, config);
  handlebarsOrigin.registerHelper('shorten', shortenFn);
  let fileContent = fs.readFileSync(path.join(__dirname, 'views/admin.tpl')).toString();
  let originResp = handlebarsOrigin.compile(fileContent)(viewData);
  handlebarsOrigin.unregisterHelper('shorten');

  t.is(originResp, await handlebars.render());
});

