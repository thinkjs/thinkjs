const test = require('ava');
const index = require('../index.js');
const helper = require('think-helper');

test('index is a function', t => {
  t.is(helper.isFunction(index), true);
})

test('injected methods', t => {
  const obj = index({});
  const keys = Object.keys(obj).sort();
  t.deepEqual(keys, [ 'context', 'controller', 'service', 'think' ]);
})


test('injected methods 2', t => {
  const obj = index({});
  const keys = Object.keys(obj.think).sort();
  t.deepEqual(keys, [ 'Mongoose', 'mongoose' ]);
})

test('injected methods 3', t => {
  const obj = index({});
  const keys = Object.keys(obj.controller).sort();
  t.deepEqual(keys, [ 'mongoose' ]);
})

test('injected methods 4', t => {
  const obj = index({});
  const keys = Object.keys(obj.context).sort();
  t.deepEqual(keys, [ 'mongoose' ]);
})

test('injected methods 5', t => {
  const obj = index({});
  const keys = Object.keys(obj.service).sort();
  t.deepEqual(keys, [ 'mongoose' ]);
})

