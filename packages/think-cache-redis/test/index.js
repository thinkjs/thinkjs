/*
* @Author: lushijie
* @Date:   2017-03-24 09:34:57
* @Last Modified by:   lushijie
* @Last Modified time: 2017-09-13 12:05:37
*/
import test from 'ava';
import RedisCache from '../index';

test.serial('set key -> get key -> del key', async t => {
  let redisCache = new RedisCache();
  let key = 'redisCache';
  let content = 'Thinkjs';
  await redisCache.set(key, content);
  let g1 = await redisCache.get(key);
  await redisCache.delete(key);
  let g2 =await redisCache.get(key);

  t.true(g1 === content && g2 === void 0)
});

test.serial('set key -> get key -> del key2', async t => {
  let redisCache = new RedisCache();
  let key = 'redisCache';
  let content = {a: {b: 'thinkjs'}};
  await redisCache.set(key, content);
  let g1 = await redisCache.get(key);
  await redisCache.delete(key);
  let g2 =await redisCache.get(key);

  t.true(g1.a.b === content.a.b && g2 === void 0)
});
