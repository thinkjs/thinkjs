import test from 'ava';
import helper from 'think-helper';
import invokeController from '../index.js';

test('ctx.module required in multi module', t => {
  const fn = invokeController(undefined, {
    modules: [1]
  });
  const error = t.throws(() => fn({}));
  t.is(true, helper.isError(error));
});

test('ctx.controller required', t => {
  const fn = invokeController(undefined, {
    modules: []
  });
  const error = t.throws(() => fn({}));
  t.is(true, helper.isError(error));
});

test('controller not exist with emptyController', t => {
  let recieved = 0;
  let expected = 0;
  const plus = () => recieved++;
  // single module but no corresponding controllers
  const fn1 = invokeController({
    emptyController: 'bar'
  }, {
    modules: [],
    controllers: {'foo': true, 'bar': function() {}}
  });
  fn1({controller: 'a', action: 'baz'}, plus);
  t.is(recieved, expected);
  // // multi module but no corresponding controllers
  // const fn2 = invokeController(undefined, {
  //   modules: [1],
  //   controllers: {'foo': {'foo': {}}}
  // })
  // fn2({controller: 'bar', action: 'baz', module: 'foo'}, plus);
  // t.is(recieved, ++expected);
});


test('ctx.action required', t => {
  const fn = invokeController(undefined, {
    modules: []
  });
  const error = t.throws(() => fn({controller: {}}));
  t.is(true, helper.isError(error));
});

test('empty controller', t => {
  let recieved = 0;
  let expected = 0;
  const plus = () => recieved++;
  // single module but no controllers
  const fn1 = invokeController(undefined, {
    modules: []
  });
  fn1({controller: 'foo', action: 'bar'}, plus);
  expected++;
  t.is(recieved, expected);
  /**
   * @throws {ReferenceError} If multi module and no controllers and with ctx.module
   */
  const fn2 = invokeController(undefined, {
    modules: ['baz']
  });
  fn2({controller: 'foo', action: 'bar', module: 'baz'}, plus);
  expected++;
  t.is(recieved, expected)
  // multi module but not specific controllers
  const fn3 = invokeController(undefined, {
    modules: ['baz'],
    controllers: {}
  });
  fn3({module: 'baz', controller: 'foo', action: 'bar'}, plus);
  expected++;
  t.is(recieved, expected)
});

test('controller not exist', t => {
  let recieved = 0;
  let expected = 0;
  const plus = () => recieved++;
  // single module but no corresponding controllers
  const fn1 = invokeController(undefined, {
    modules: [],
    controllers: {'foo': true}
  });
  fn1({controller: 'bar', action: 'baz'}, plus);
  t.is(recieved, ++expected);
  // multi module but no corresponding controllers
  const fn2 = invokeController(undefined, {
    modules: [1],
    controllers: {'foo': {'foo': {}}}
  })
  fn2({controller: 'bar', action: 'baz', module: 'foo'}, plus);
  t.is(recieved, ++expected);
});

test('__before', async t => {
  let recieved = 0;
  let expected = 0;
  const getFn = __before => invokeController(undefined, {
    modules: [],
    controllers: {
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
  const fn = invokeController(undefined, {
    modules: [],
    controllers: {
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
  const fn = invokeController(undefined, {
    modules: [],
    controllers: {
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
