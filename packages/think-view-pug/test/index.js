/*
* @Author: lushijie
* @Date:   2017-03-13 10:55:10
* @Last Modified by:   lushijie
* @Last Modified time: 2017-03-13 12:27:44
*/

import test from 'ava';
import helper from 'think-helper';
import path from 'path';
import fs from 'fs';
import pugOrigin from 'pug';
import Pug from '../index.js';

// test case
test.serial('pug render', async t => {
  let options = {
    cache: false,
    debug: false
  };

  let viewData = {name: 'Thinkjs'};
  let originOut = pugOrigin.renderFile(path.join(__dirname, '/views/home.jade'), helper.extend({}, options, viewData));
  let pugInst = new Pug('home.jade', viewData, {viewPath: path.join(__dirname, '/views')});

  t.is(originOut, await pugInst.render());
});

test.serial('pug render err when file is not exsit', async t => {
  let viewData = {name: 'Thinkjs'};

  try {
    let pugInst = new Pug('noExit.jade', viewData, {viewPath: path.join(__dirname, '/views')});
    await pugInst.render()
  }
  catch(e) {
    t.pass();
  }
});

test.serial('pug render with absolute path', async t => {
  let viewData = {name: 'Thinkjs'};

  try {
    let pugInst = new Pug(path.join(__dirname, '/views/home.jade'), viewData, {viewPath: path.join(__dirname, '/views')});
    await pugInst.render()
  }
  catch(e) {
    t.pass();
  }
});

test.serial('pug render with beforeRender', async t => {
  let viewData = {name: 'Thinkjs'};
  let filterFn = (text, options) => {
    if (options.addStart) text = 'Start\n' + text;
    if (options.addEnd)   text = text + '\nEnd';
    return text;
  };

  let options = {
    cache: false,
    debug: false,
    viewPath: path.join(__dirname, '/views'),
    beforeRender: (pug, config) => {
      pug.filters['my-own-filter'] = filterFn;
    }
  };
  let pugInst = new Pug(
      path.join(__dirname, '/views/filter.jade'),
      {}, // viewData
      helper.extend({}, options, {
        beforeRender: (pug, config) => {
          pug.filters['my-own-filter'] = filterFn;
        }
      })
  );

  pugOrigin.filters['my-own-filter'] = filterFn;
  let originOut = pugOrigin.renderFile(
    path.join(__dirname, '/views/filter.jade'),
    helper.extend({}, options)
  );
  t.is(originOut, await pugInst.render());
});


