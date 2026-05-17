/*
* @Author: lushijie
* @Date:   2017-03-27 14:43:51
* @Last Modified by:   lushijie
* @Last Modified time: 2017-04-01 16:33:19
*/
import test from 'ava';
import helper from 'think-helper';
import path from 'path';
import fs from 'fs';
import Memcache from '../index';

test.serial('set key & get key & del key', async t => {
  let key1 = 'name1', value1 = 'thinkjs';
  let key2 = 'name2', value2 = 'thinkjs';
  let key3 = 'name3', value3 = 'thinkjs';
  let key4 = 'name4', value4 = 'thinkjs';

  let memInst = new Memcache();
  let s1 = await memInst.set(key1, value1);
  let g1 = await memInst.get(key1);
  let s2 = await memInst.set(key2, value2,  -1000);
  let g2 = await memInst.get(key2);
  let s3 = await memInst.set(key3, value3, 31*24*3600);
  let g3 = await memInst.get(key3);
  let s4 = await memInst.set(key4, value4, 0);
  let g4 = await memInst.get(key4);

  t.true(g1 === value1 && !g2 && g3 === value3 && g4 === value4)
});

test.serial('increase & decrease', async t => {
  let memInst = new Memcache();
  let key5 = 'name66';
  let s1 = await memInst.set(key5, '10');
  await memInst.increase(key5);
  let g1 = await memInst.get(key5);
  await memInst.decrease(key5);
  let g2 = await memInst.get(key5);
  let d1 = await memInst.delete(key5);
  await memInst.close();

  t.true(g1 === '11' && g2 === '10');
});

