const test = require('ava');
const mock = require('mock-require');

mock('ioredis', './fake-redis.js');
const Redis = require('../index.js');

test.serial('set key & get key & del key', async t => {
  const key = 'name1';
  const value = 'thinkjs';
  const redisInst = new Redis();
  redisInst.on('connect', function() {
    // console.log('connect...')
  });
  const s = await redisInst.set(key, value);
  const g1 = await redisInst.get(key);
  const d = await redisInst.delete(key);
  const g2 = await redisInst.get(key);

  t.true(s === 'OK' && g1 === value && d === 1 && g2 === null);
});

test.serial('set key', async t => {
  const redisInst = new Redis();
  const s1 = await redisInst.set('name2', 'lushijie');
  const s2 = await redisInst.set('name3', 'lushijie', 3000);
  const s3 = await redisInst.set('name4', 'lushijie', 'EX', 5);
  const s4 = await redisInst.set('name5', 'lushijie', 'PX', 10000);
  redisInst.close();
  redisInst.close();

  t.true(s1 === 'OK' && s2 === 'OK' && s3 === 'OK' && s4 === 'OK');
});

test.serial('set key and then incr & decr ', async t => {
  const key = 'id';
  const redisInst = new Redis();
  await redisInst.set(key, '100', 365 * 24 * 3600);
  await redisInst.increase(key).catch((e) => {
    // eslint-disable-next-line no-console
    console.log(e);
  });
  const g1 = await redisInst.get(key);

  await redisInst.decrease(key).catch((e) => {
    // eslint-disable-next-line no-console
    console.log(e);
  });
  const g2 = await redisInst.get(key);
  t.true(g1 === '101' && g2 === '100');
});

test.serial('clear keys', async t => {
  const keys = 'na*';
  const redisInst = new Redis();
  await redisInst.set('name2', 'lushijie');
  const g1 = await redisInst.get('name2');
  const result = await redisInst.deleteRegKey(keys);
  const g2 = await redisInst.get('name2');
  t.true(
    g1 === 'lushijie' && g2 === null && result === 'OK'
  );
});
