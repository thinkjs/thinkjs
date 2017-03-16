/*
* @Author: lushijie
* @Date:   2017-03-16 09:23:29
* @Last Modified by:   lushijie
* @Last Modified time: 2017-03-16 16:34:19
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

function getCacheFilePath(key, config) {
  let cacheFileDir = helper.md5(key).slice(0, config.path_depth).split('').join(path.sep);
  return path.join(__dirname, 'cache', cacheFileDir, helper.md5(key)) + config.file_ext;
}

test.serial.cb.afterEach(t => {
  let cachePath = path.join(__dirname, 'cache');
  helper.rmdir(cachePath, false).then(() => {
    t.end();
  });
});

test.serial('set key & get key & del key', async t => {
  let key = 'name';
  let config = helper.extend({}, myOptions);
  let cacheInst = new FileCache(config);
  await cacheInst.set(key, 'thinkjs');
  let ret1 = await cacheInst.get(key);
  await cacheInst.delete(key);
  let ret2 = await cacheInst.get(key);

  t.true(ret1 === 'thinkjs' && ret2 === undefined);
});

test.serial('set key & get key & del key without path_depth', async t => {
  let key = 'name';
  let config = helper.extend({}, myOptions, {path_depth: null});
  let cacheInst = new FileCache(config);
  await cacheInst.set(key, 'thinkjs');
  let ret1 = await cacheInst.get(key);
  t.true(ret1 === 'thinkjs');
});

test.serial('get expired key', async t => {
  let key = 'name1';
  let config = helper.extend({}, myOptions);
  let cacheInst = new FileCache(config);
  await cacheInst.set(key, 'thinkjs', -1);
  let ret = await cacheInst.get(key);

  t.true(ret === undefined);
});

test.serial('gc', async t => {
  let key1 = 'name1';
  let config1 = helper.extend({}, myOptions);
  let cacheInst1 = new FileCache(config1);
  await cacheInst1.set(key1, 'thinkjs', -1);

  let key2 = 'name2';
  let config2 = helper.extend({}, myOptions);
  let cacheInst2 = new FileCache(config2);
  await cacheInst2.set(key2, 'thinkjs');

  // cacl name1's cache path
  let cacheExpiredPath = path.join(__dirname, 'cache', helper.md5(key1).slice(0, config1.path_depth).split('').join(path.sep));

  t.true(helper.getdirFiles(cacheExpiredPath).length === 0);
});

test.serial('get key with error', async t => {
  let config = helper.extend({}, myOptions);
  let key = 'name1';
  let cacheInst = new FileCache(config);
  await cacheInst.set(key, 'thinkjs');

  // modify the file
  let cacheFilePath = getCacheFilePath(key, config);
  fs.writeFileSync(cacheFilePath, 'Hello World');

  let ret = await cacheInst.get(key);
  t.true(ret === undefined);
});
