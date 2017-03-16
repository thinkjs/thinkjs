/*
* @Author: lushijie
* @Date:   2017-03-16 09:23:29
* @Last Modified by:   lushijie
* @Last Modified time: 2017-03-16 15:02:17
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

test.serial('set key & get key & del key', async t => {
  let config = helper.extend({}, myOptions);
  let cacheInst = new FileCache(myOptions);

  //set
  await cacheInst.set('name', 'thinkjs');

  // get1
  let ret1 = await cacheInst.get('name');

  //del
  await cacheInst.delete('name');

  // get2
  let ret2 = await cacheInst.get('name');

  t.true(ret1 === 'thinkjs' && ret2 === undefined);
});
