/*
* @Author: lushijie
* @Date:   2017-03-24 09:34:57
* @Last Modified by:   lushijie
* @Last Modified time: 2017-04-01 17:20:14
*/
import test from 'ava';
import MemcacheCache from '../index';

test.serial('set key -> get key -> del key', async t => {
  let cachehInst = new MemcacheCache();
  let key = 'redisCache';
  let content = 'Thinkjs';
  await cachehInst.set(key, content);
  let g1 = await cachehInst.get(key);
  await cachehInst.delete(key);
  let g2 =await cachehInst.get(key);

  t.true(g1 === content && g2 === null)
});
