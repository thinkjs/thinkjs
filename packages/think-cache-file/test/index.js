/*
* @Author: lushijie
* @Date:   2017-03-16 09:23:29
* @Last Modified by:   lushijie
* @Last Modified time: 2017-03-16 15:50:43
*/
import test from 'ava';
import helper from 'think-helper';
import path from 'path';
import fs from 'fs';
import FileCache from '../index';

let myOptions = {
  timeout: 3600,
  file_ext: '.txt',
  dir_path: path.join(__dirname, 'cache'),
  path_depth: 1
};

test.serial.cb.beforeEach(t => {
  let cachePath = path.join(__dirname, 'cache');
  helper.rmdir(cachePath, false).then(() => {
    t.end();
  });
});

test.serial('set key & get key & del key', async t => {
  let config = helper.extend({}, myOptions);
  let cacheInst = new FileCache(config);
  await cacheInst.set('name', 'thinkjs');
  let ret1 = await cacheInst.get('name');
  await cacheInst.delete('name');
  let ret2 = await cacheInst.get('name');

  t.true(ret1 === 'thinkjs' && ret2 === undefined);
});

test.serial('set key & get key & del key without path_depth', async t => {
  let config = helper.extend({}, myOptions, {path_depth: null});
  let cacheInst = new FileCache(config);
  await cacheInst.set('name', 'thinkjs');
  let ret1 = await cacheInst.get('name');
  t.true(ret1 === 'thinkjs');
});


test.serial('get expired key', async t => {
  let config = helper.extend({}, myOptions);
  let cacheInst = new FileCache(config);
  await cacheInst.set('name1', 'thinkjs', -1);
  let ret = await cacheInst.get('name1');

  t.true(ret === undefined);
});


test.serial('gc', async t => {
  let config1 = helper.extend({}, myOptions);
  let cacheInst1 = new FileCache(config1);
  await cacheInst1.set('name1', 'thinkjs', -1);

  let config2 = helper.extend({}, myOptions);
  let cacheInst2 = new FileCache(config2);
  await cacheInst2.set('name2', 'thinkjs');

  // cacl name1's cache path
  let cacheExpiredPath = path.join(__dirname, 'cache', helper.md5('name1').slice(0, config1.path_depth).split('').join(path.sep));

  t.true(helper.getdirFiles(cacheExpiredPath).length === 0);
});
