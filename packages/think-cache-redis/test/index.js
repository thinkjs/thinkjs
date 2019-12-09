/*
* @Author: lushijie
* @Date:   2017-03-24 09:34:57
* @Last Modified by:   lushijie
* @Last Modified time: 2017-09-13 12:05:37
*/
import test from 'ava';
import RedisCache from '../index';

test.serial('set key -> get key -> del key', async t => {
  const redisCache = new RedisCache();
  const key = 'redisCache';
  const content = 'Thinkjs';
  await redisCache.set(key, content);
  const g1 = await redisCache.get(key);
  await redisCache.delete(key);
  const g2 = await redisCache.get(key);

  t.true(g1 === content && g2 === void 0);
});

test.serial('set key -> get key -> del key2', async t => {
  const redisCache = new RedisCache();
  const key = 'redisCache';
  const content = {a: {b: 'thinkjs'}};
  await redisCache.set(key, content);
  const g1 = await redisCache.get(key);
  await redisCache.delete(key);
  const g2 = await redisCache.get(key);

  t.true(g1.a.b === content.a.b && g2 === void 0);
});

test.serial('set key1 -> get ke1 -> set key2 ->get key2 ->delCache ke1 key2', async t => {
  const redisCache = new RedisCache();
  const key1 = 'name1';
  const key2 = 'name2';
  const regKey = 'nam*';
  const content1 = {a: {b: 'thinkjs'}};
  const content2 = {c: {d: 'thinkjs'}};
  await redisCache.set(key1, content1);
  await redisCache.set(key2, content2);
  const g1 = await redisCache.get(key1);
  const g2 = await redisCache.get(key2);
  const regRes = await redisCache.delete(regKey);
  const res1 = await redisCache.get(key1);
  const res2 = await redisCache.get(key2);
  t.true(g1.a.b === content1.a.b && g2.c.d === content2.c.d && regRes === 'OK' && res1 === void 0 && res2 === void 0);
});
