const test = require('ava');
const Parser = require('../src/parser');
const {ObjectID} = require('mongodb');
const parser = new Parser();

test.serial('parseField with array field', async t => {
  const ret = parser.parseField(['name', 'gender'], 1);
  t.is(ret.name, 0);
});

test.serial('parseField with object field', async t => {
  const ret = parser.parseField({name: 'think'});
  t.is(ret.name, 'think');
});

test.serial('parseOrder', async t => {
  const ret = parser.parseOrder(true);
  t.is(ret.$natural, 1);
});

test.serial('parseOrder with array', async t => {
  const ret = parser.parseOrder(['id', 'name']);
  t.deepEqual(ret, [1, 1]);
});

test.serial('parseOrder with array', async t => {
  const ret = parser.parseOrder('id DESC,name');
  t.deepEqual(ret, {id: -1, name: 1});
});

test.serial('parseWhere with array', async t => {
  const where = [{_id: new ObjectID()}];
  const ret = parser.parseWhere(where);
  t.deepEqual(!!ret, true);
});

test.serial('parseWhere with array 2', async t => {
  const where = [{_id: 'thinkjs'}];
  const ret = parser.parseWhere(where);
  t.deepEqual(ret, [{_id: 'thinkjs'}]);
});
