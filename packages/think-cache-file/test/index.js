/*
* @Author: lushijie
* @Date:   2017-03-16 09:23:29
* @Last Modified by:   lushijie
* @Last Modified time: 2017-03-24 15:55:58
*/
import test from 'ava';
import helper from 'think-helper';
import path from 'path';
import fs from 'fs';
import FileCache from '../index';

let myConfig = {
  timeout: 3600 * 1000,
  cachePath: path.join(__dirname, 'cache'),
  pathDepth: 1
};

function getCacheFilePath(key, config) {
  let cacheFileDir = helper.md5(key).slice(0, config.pathDepth).split('').join(path.sep);
  return path.join(__dirname, 'cache', cacheFileDir, helper.md5(key));
}

test.serial.cb.afterEach(t => {
  let cachePath = path.join(__dirname, 'cache');
  helper.rmdir(cachePath, false).then(() => {
    t.end();
  });
});

test.serial('set key -> get key -> del key', async t => {
  let key = 'name';
  let config = helper.extend({}, myConfig);
  let cacheInst = new FileCache(config);
  await cacheInst.set(key, 'thinkjs');
  let ret1 = await cacheInst.get(key);
  await cacheInst.delete(key);
  let ret2 = await cacheInst.get(key);

  t.true(ret1 === 'thinkjs' && ret2 === undefined);
});

test.serial('get expired key', async t => {
  let key = 'name1';
  let config = helper.extend({}, myConfig);
  let cacheInst = new FileCache(config);
  await cacheInst.set(key, 'thinkjs', -1000);
  let ret = await cacheInst.get(key);

  t.true(ret === undefined);
});

test.serial('get key with error', async t => {
  let config = helper.extend({}, myConfig);
  let key = 'name1';
  let cacheInst = new FileCache(config);
  await cacheInst.set(key, 'thinkjs');

  // modify the cache file
  let cacheFilePath = getCacheFilePath(key, config);
  fs.writeFileSync(cacheFilePath, 'Hello World');

  let ret = await cacheInst.get(key);
  t.true(ret === undefined);
});

test.serial('normal gc', async t => {
  let key1 = 'name1';
  let key2 = 'name2';
  let config1 = helper.extend({}, myConfig);
  let cacheInst1 = new FileCache(config1);
  await cacheInst1.set(key1, 'thinkjs', -1000);
  await cacheInst1.set(key2, 'thinkjs');
  cacheInst1.gc();
});

test.serial('gc content error', async t => {
  let key1 = 'name11';
  let key2 = 'name22';
  let config1 = helper.extend({}, myConfig);
  let cacheInst1 = new FileCache(config1);

  // not json
  let cacheFilePath2 = getCacheFilePath(key1, config1);
  helper.mkdir(path.dirname(cacheFilePath2));
  fs.writeFileSync(cacheFilePath2, 'Thinkjs');

  // empty content
  let cacheFilePath3 = getCacheFilePath(key2, config1);
  helper.mkdir(path.dirname(cacheFilePath3));
  fs.writeFileSync(cacheFilePath3, '');
  cacheInst1.gc();
});
