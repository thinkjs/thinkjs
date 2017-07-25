const ava = require('ava');
const helper = require('think-helper');
const Base = require('../../lib/parser');

ava.test('escapeString is function', t => {
  const instance = new Base();
  t.true(helper.isFunction(instance.escapeString));
});

ava.test('escapeString, empty', t => {
  const instance = new Base();
  const data = instance.escapeString();
  t.is(data, '');
});

ava.test('escapeString, \\n', t => {
  const instance = new Base();
  const data = instance.escapeString('\n');
  t.is(data, '\\n');
});

ava.test('escapeString, \\0', t => {
  const instance = new Base();
  const data = instance.escapeString('\0');
  t.is(data, '\\0');
});

ava.test('escapeString, \\r', t => {
  const instance = new Base();
  const data = instance.escapeString('\r');
  t.is(data, '\\r');
});

ava.test('escapeString, \\b', t => {
  const instance = new Base();
  const data = instance.escapeString('\b');
  t.is(data, '\\b');
});

ava.test('escapeString, \\t', t => {
  const instance = new Base();
  const data = instance.escapeString('\t');
  t.is(data, '\\t');
});

ava.test('escapeString, \\Z', t => {
  const instance = new Base();
  const data = instance.escapeString('\u001a');
  t.is(data, '\\Z');
});

ava.test('escapeString, \\"', t => {
  const instance = new Base();
  const data = instance.escapeString('"');
  t.is(data, '\\"');
});

ava.test('parseKey is function', t => {
  const instance = new Base();
  const key = instance.parseKey('key');
  t.is(key, '`key`');
});
