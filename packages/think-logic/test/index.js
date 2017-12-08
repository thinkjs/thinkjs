import test from 'ava';
import helper from 'think-helper';
import invokeLogic from '../index.js';

test('ctx.module required in multi module', t => {
  const fn = invokeLogic(undefined, {
    modules: [1]
  });
  const error = t.throws(() => fn({}));
  t.is(true, helper.isError(error));
});

test('ctx.controller required', t => {
  const fn = invokeLogic(undefined, {
    modules: []
  });
  const error = t.throws(() => fn({}));
  t.is(true, helper.isError(error));
});

test('ctx.action required', t => {
  const fn = invokeLogic(undefined, {
    modules: []
  });
  const error = t.throws(() => fn({controller: {}}));
  t.is(true, helper.isError(error));
});

test('empty logics', t => {
  let recieved = 0;
  let expected = 0;
  const plus = () => recieved++;
  // single module but no logics
  const fn1 = invokeLogic(undefined, {
    modules: []
  });
  fn1({controller: 'foo', action: 'bar'}, plus);
  expected++;
  t.is(recieved, expected);
  /**
   * @throws {ReferenceError} If multi module and no logics and with ctx.module
   */
  const fn2 = invokeLogic(undefined, {
    modules: ['baz'],
  });
  fn2({controller: 'foo', action: 'bar', module: 'baz'}, plus);
  expected++;
  t.is(recieved, expected)
  // multi module but no specific controller
  const fn3 = invokeLogic(undefined, {
    modules: ['baz'],
    logics: {}
  });
  fn3({module: 'baz', controller: 'foo', action: 'bar'}, plus);
  expected++;
  t.is(recieved, expected)
});

test('logic not exist', t => {
  let recieved = 0;
  let expected = 0;
  const plus = () => recieved++;
  // single module but no corresponding logics
  const fn1 = invokeLogic(undefined, {
    modules: [],
    logics: {'foo': true}
  });
  fn1({controller: 'bar', action: 'baz'}, plus);
  t.is(recieved, ++expected);
  // multi module but no corresponding logics
  const fn2 = invokeLogic(undefined, {
    modules: [1],
    logics: {'foo': {'foo': {}}}
  })
  fn2({controller: 'bar', action: 'baz', module: 'foo'}, plus);
  t.is(recieved, ++expected);
});

test('__before', async t => {
  let recieved = 0;
  let expected = 0;
  const getFn = __before => invokeLogic(undefined, {
    modules: [],
    logics: {
      foo: class {
        constructor () {
          this.__before = __before;
        }
      }
    }
  });
  const args = [{controller: 'foo', action: 'bar'}, () => recieved++];
  // sync && normal
  const fn1 = getFn(() => {});
  await fn1(...args);
  t.is(recieved, ++expected);
  // sync && return false
  const fn2 = getFn(() => false);
  const ans2 = await fn2(...args);
  t.is(ans2, undefined);
  t.is(recieved, expected);
  // async && resolve
  const fn3 = getFn(() => Promise.resolve());
  await fn3(...args);
  t.is(recieved, ++expected);
  // async && resolve false
  const fn4 = getFn(() => Promise.resolve(false));
  const ans4 = await fn4(...args);
  t.is(ans4, undefined);
  t.is(recieved, expected);
});

test('action', async t => {
  let barExpected = 0;
  let barRecieved = 0;
  let callExpected = 0;
  let callRecieved = 0;
  const fn = invokeLogic(undefined, {
    modules: [],
    logics: {
      foo: class {
        barAction () {
          barRecieved++;
        }
        __call () {
          callRecieved++;
        }
      }
    }
  });
  await fn({controller: 'foo', action: 'bar'}, () => {});
  t.is(barRecieved, ++barExpected);
  t.is(callRecieved, callExpected);
  await fn({controller: 'foo', action: 'baz'}, () => {});
  t.is(barRecieved, barExpected);
  t.is(callRecieved, ++callExpected);
});

test('after', async t => {
  let expected = 0;
  let recieved = 0;
  const fn = invokeLogic(undefined, {
    modules: [],
    logics: {
      foo: class {
        __after () {
          recieved++;
        }
      }
    }
  });
  await fn({controller: 'foo', action: 'bar'}, () => {});
  t.is(recieved, ++expected);
});
