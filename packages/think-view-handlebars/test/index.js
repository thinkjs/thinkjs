/*
* @Author: lushijie
* @Date:   2017-02-14 10:56:08
* @Last Modified by:   lushijie
* @Last Modified time: 2017-03-13 10:33:13
*/
import test from 'ava';
import helper from 'think-helper';
import path from 'path';
import fs from 'fs';
import hdb from 'handlebars';
import Handlebars from '../index.js';

// test case
test.serial('handlebars default render', async t => {
  let options = {
    compat: true,
    strict: false,
    preventIndent: true,
    ignoreStandalone: true,
    cache: false
  };

  let viewData = {title: 'This is title', 'body': 'Hello World'};
  let viewBasePath = path.join(__dirname, 'views');
  let config = helper.extend({}, {viewPath: viewBasePath}, options);
  let handlebars = new Handlebars('./home.tpl', viewData, config);
  let fileContent = fs.readFileSync(path.join(__dirname, 'views/home.tpl')).toString();
  let originResp = hdb.compile(fileContent)(viewData);

  t.is(originResp, await handlebars.render())
});

test.serial('handlebars with absolute path', async t => {
  let options = {
    compat: true,
    strict: false,
    preventIndent: true,
    ignoreStandalone: true,
    cache: false
  };

  let viewData = {title: 'This is title', 'body': 'Hello World'};
  let viewBasePath = path.join(__dirname, 'views');
  let config = helper.extend({}, {viewPath: viewBasePath}, options);
  let handlebars = new Handlebars(path.join(viewBasePath, './home.tpl'), viewData, config);
  let fileContent = fs.readFileSync(path.join(__dirname, 'views/home.tpl')).toString();
  let originResp = hdb.compile(fileContent)(viewData);

  t.is(originResp, await handlebars.render());
});

test.serial('get content err', async t => {
  let options = {
    compat: true,
    strict: false,
    preventIndent: true,
    ignoreStandalone: true,
    cache: false
  };

  let viewData = {title: 'This is title'};
  let viewBasePath = path.join(__dirname, 'views');
  let config = helper.extend({}, {viewPath: viewBasePath}, options);
  let handlebars = new Handlebars(path.join(viewBasePath, './noExit.tpl'), viewData, config);

  try {
    let ret = await handlebars.render();
    console.log(ret);
  }catch(e) {
    t.pass();
  }
});

test.serial('handlebars with cache', async t => {
  let options = {
    compat: true,
    strict: false,
    preventIndent: true,
    ignoreStandalone: true,
    cache: true
  };

  let viewData = {title: 'This is title', 'body': 'Hello World'};
  let viewBasePath = path.join(__dirname, 'views');
  let config = helper.extend({}, {viewPath: viewBasePath}, options);
  let handlebars = new Handlebars(path.join(viewBasePath, './home.tpl'), viewData, config);

  t.is(await handlebars.render(), await handlebars.render());
});

test.serial('handlebars with registerHelper', async t => {
  let options = {
    compat: true,
    strict: false,
    preventIndent: true,
    ignoreStandalone: true,
    cache: false,
    beforeRender: (handlebars, config) => {
      handlebars.registerHelper('shorten', str => {
        return str.slice(0, 5);
      })
    }
  };

  let viewData = {title: 'thinkjs'};
  let viewBasePath = path.join(__dirname, 'views');
  let config = helper.extend({}, {viewPath: viewBasePath}, options);
  let handlebars = new Handlebars('./admin.tpl', viewData, config);
  hdb.registerHelper('shorten', str => {
    return str.slice(0, 5);
  });
  let fileContent = fs.readFileSync(path.join(__dirname, 'views/admin.tpl')).toString();
  let originResp = hdb.compile(fileContent)(viewData);
  hdb.unregisterHelper('shorten');
  t.is(originResp, await handlebars.render());
});

