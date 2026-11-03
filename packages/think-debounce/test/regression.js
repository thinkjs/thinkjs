const {test} = require('node:test');
const assert = require('node:assert/strict');
const Debounce = require('..');
const nextTick = () => new Promise(resolve => process.nextTick(resolve));

test('CommonJS exports the constructor directly, including the existing deep path', () => {
  assert.equal(typeof Debounce, 'function');
  assert.equal(Debounce, require('../index.js'));
  assert.equal(Debounce.default, undefined);
});

test('coalesces concurrent calls and shares the identical result', async () => {
  const instance = new Debounce();
  const result = {id: 1};
  let calls = 0;
  const promises = Array.from({length: 10}, () => instance.debounce('shared', () => {
    calls++;
    return Promise.resolve(result);
  }));
  const values = await Promise.all(promises);
  values.forEach(value => assert.equal(value, result));
  assert.equal(calls, 1);
  assert.deepEqual(instance.queues, {});
});

test('supports synchronous values, thenables, and independent keys', async () => {
  const instance = new Debounce();
  assert.deepEqual(await Promise.all([
    instance.debounce('a', () => 1),
    instance.debounce('b', () => ({then: resolve => resolve(2)})),
    instance.debounce('c', () => undefined)
  ]), [1, 2, undefined]);
  await nextTick();
  assert.deepEqual(instance.queues, {});
});

for (const synchronous of [true, false]) {
  test(`propagates ${synchronous ? 'thrown' : 'rejected'} errors to every waiter and allows retry`, async () => {
    const instance = new Debounce();
    const error = new Error('failure');
    let calls = 0;
    const callback = () => {
      calls++;
      if (synchronous) throw error;
      return Promise.reject(error);
    };
    const results = await Promise.allSettled([
      instance.debounce('error', callback),
      instance.debounce('error', callback),
      instance.debounce('error', callback)
    ]);
    assert.equal(calls, 1);
    results.forEach(result => {
      assert.equal(result.status, 'rejected');
      assert.equal(result.reason, error);
    });
    assert.deepEqual(instance.queues, {});
    assert.equal(await instance.debounce('error', () => 'recovered'), 'recovered');
    await nextTick();
  });
}

test('retains nextTick cleanup timing and reruns completed keys', async () => {
  const instance = new Debounce();
  let calls = 0;
  const first = instance.debounce('timing', () => ++calls);
  const late = first.then(() => instance.debounce('timing', () => ++calls));
  assert.deepEqual(await Promise.all([first, late]), [1, 1]);
  assert.equal(await instance.debounce('timing', () => ++calls), 2);
  await nextTick();
});

test('instances have separate queues', async () => {
  assert.deepEqual(await Promise.all([
    new Debounce().debounce('same', () => 1),
    new Debounce().debounce('same', () => 2)
  ]), [1, 2]);
  await nextTick();
});
