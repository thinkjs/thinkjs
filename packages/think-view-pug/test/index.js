/*
* @Author: lushijie
* @Date:   2017-03-13 10:55:10
* @Last Modified by:   lushijie
* @Last Modified time: 2017-03-13 14:56:32
*/

import test from 'ava';
import helper from 'think-helper';
import path from 'path';
import fs from 'fs';
import pugOrigin from 'pug';
import Pug from '../index.js';

let defaultOptions = {
  cache: false,
  debug: false
};
let viewBasePath = path.join(__dirname, 'views');
let viewData = {name: 'thinkjs'};


test.serial('pug render', async t => {
  let config = helper.extend({}, defaultOptions, viewData, {viewPath: viewBasePath});
  let originOut = pugOrigin.renderFile(path.join(__dirname, '/views/home.jade'), config);
  let pugInst = new Pug('home.jade', viewData, config);

  t.is(originOut, await pugInst.render());
});

test.serial('pug render err when file is not exsit', async t => {
  let config = helper.extend({}, defaultOptions, viewData, {viewPath: viewBasePath});
  try {
    let pugInst = new Pug('noExit.jade', viewData, config);
    await pugInst.render()
  }
  catch(e) {
    t.pass();
  }
});

test.serial('pug render with absolute path', async t => {
  let config = helper.extend({}, defaultOptions, viewData, {viewPath: viewBasePath});
  try {
    let pugInst = new Pug(path.join(__dirname, '/views/home.jade'), viewData, config);
    await pugInst.render()
  }
  catch(e) {
    t.pass();
  }
});

test.serial('pug render with beforeRender', async t => {
  let filterFn = (text, options) => {
    if (options.addStart) text = 'Start\n' + text;
    if (options.addEnd)   text = text + '\nEnd';
    return text;
  };
  let config = helper.extend({}, defaultOptions, {
    viewPath: viewBasePath,
    beforeRender: (pug, config) => {
      pug.filters['my-own-filter'] = filterFn;
    }
  });
  let pugInst = new Pug(path.join(viewBasePath, '/filter.jade'), viewData, config);
  pugOrigin.filters['my-own-filter'] = filterFn;
  let originOut = pugOrigin.renderFile( path.join(viewBasePath, '/filter.jade'), helper.extend({}, defaultOptions, {viewPath: viewBasePath}));

  t.is(originOut, await pugInst.render());
});


