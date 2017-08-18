const test = require('ava');
const helper = require('think-helper');
const {extendClassMethods} = require('../../lib/util.js');

test('extendClassMethods', t => {
  const target = {};
  const source = {a: 1, b: 2};
  extendClassMethods(target, source);
  t.deepEqual(target, { a: 1, b: 2 });
});

test('extendClassMethods with getter', t => {
  const target = {};
  const source = {a: 1, get b() {return 2}};
  extendClassMethods(target, source);
  t.deepEqual(target, { a: 1 });
  t.is(target.b, 2);
});

test('extendClassMethods with setter', t => {
  const target = {};
  const source = {a: 1, set b(value) {this.a = value}};
  extendClassMethods(target, source);
  target.b = 3;
  t.is(target.a, 3);
});

test('extendClassMethods with getter, setter', t => {
  const target = {};
  const source = {get a() {return this.xxx;}, set a(value) {this.xxx = value}};
  extendClassMethods(target, source);
  target.a = 3;
  t.is(target.a, 3);
  t.is(target.xxx, 3);
});

test('extendClassMethods with getter, setter', t => {
  const target = {};
  const source = {schema: 1};
  extendClassMethods(target, source);
  t.deepEqual(target, {});
});