/*
* @Author: lushijie
* @Date:   2017-03-27 14:43:51
* @Last Modified by:   lushijie
* @Last Modified time: 2017-04-01 15:38:34
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

  // console.log('关闭之前\n\n', memInst.memcache);
  memInst.on('reconnecting', function() {
    console.log('reconnect');
  });

  let s1 = await memInst.set(key1, value1);
  let g1 = await memInst.get(key1);
  await memInst.close();

  let s2 = await memInst.set(key2, value2,  -1000);
  let g2 = await memInst.get(key2);
  await memInst.close();

  let s3 = await memInst.set(key3, value3, 31*24*3600);
  let g3 = await memInst.get(key3);
  await memInst.close();

  let s4 = await memInst.set(key4, value4, 0);
  let g4 = await memInst.get(key4);
  await memInst.close();

  // console.log('关闭之后\n\n', memInst.memcache);


  t.true(g1 === value1 && !g2 && g3 === value3 && g4 === value4)
});

test.serial('increase & decrease & close', async t => {
  let memInst = new Memcache();
  await memInst.close();
  console.log(memInst.memcache)
  memInst.on('reconnecting', () => {
    // todo
  });
  let key5 = 'name5';
  let s1 = await memInst.set(key5, '10');
  await memInst.increase(key5);
  let g1 = await memInst.get(key5);
  await memInst.decrease(key5);
  let g2 = await memInst.get(key5);
  let d1 = await memInst.delete(key5);
  await memInst.close();

  t.true(g1 === '11' && g2 === '10');
});

// test.serial('increase & decrease error', async t => {
//   let memInst = new Memcache();
//   let key6 = 'name6';
//   let key6IncreaseError = false, key6DecreaseError = false;
//   await memInst.set(key6, '10S');
//   try {
//     await memInst.decrease(key6);
//   }
//   catch(e){
//     key6IncreaseError = true;
//   }

//   try {
//     await memInst.increase(key6);
//   }
//   catch(e){
//     key6DecreaseError = true;
//   }

//   t.true(key6IncreaseError && key6DecreaseError);
// });


