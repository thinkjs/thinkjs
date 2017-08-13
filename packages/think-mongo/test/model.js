const test = require('ava');
const model = require('../src/model');

const defaultTable = 'test';
const defaultOptions = {
  database: 'think_db',
  pagesize:2
};

const manyData = [
  {name:'thinkjs',version:'3.0'},
  {name:'thinkjs',version:'2.0'},
  {name:'thinkjs',version:'1.0'},
  {name:'kobe'},
  {name:'lebron'},
  {name:'durant'},
  {name:'curry'},
];

test.afterEach.always(_ => {
  let m = new model(defaultTable, defaultOptions);
  m.delete()
});

test.serial('model', async t => {
  let m = new model(defaultTable, defaultOptions);
  let ret = m.model('test');
  t.is(ret.modelName,'test');
});

test.serial('add data', async t => {
  let m = new model(defaultTable, defaultOptions);
  let insertId = await m.add({name: 'thinkjs'});
  t.is(!!insertId, true);
});

test.serial('where', async t => {
  let m = new model(defaultTable, defaultOptions);
  let data = {name:'query data'};
  await m.add(data);
  let ret = await m.where(data).find();
  t.is(ret.name,data.name);
});

test.serial('where with empty', async t => {
  let m = new model(defaultTable, defaultOptions);
  let data = {name:'query data'};
  await m.add(data);
  let ret = await m.where().find();
  t.is(ret.name,data.name);
});

test.serial('field', async t => {
  let m = new model(defaultTable, defaultOptions);
  let data = [
    {name:'thinkjs',version:3},
    {name:'thinkjs',version:2},
  ];
  await m.addMany(data);
  let ret = await m.field('version').select();
  t.is(ret[0].name,undefined);
  t.is(ret[1].version,2);
});

test.serial('field with empty', async t => {
  let m = new model(defaultTable, defaultOptions);
  let data = {name:'thinkjs',version:3};
  await m.add(data);
  let ret = await m.field().select();
  t.is(ret[0].name,data.name);
});

test.serial('limit', async t => {
  let m = new model(defaultTable, defaultOptions);
  await m.addMany(manyData);
  let ret = await m.limit(1).select();
  t.is(ret[0].version,manyData[0].version);
  t.is(ret.length,1);
});

test.serial('limit without params', async t => {
  let m = new model(defaultTable, defaultOptions);
  await m.addMany(manyData);
  let ret = await m.limit().select();
  t.is(ret.length,manyData.length);
});

test.serial('limit with array params', async t => {
  let m = new model(defaultTable, defaultOptions);
  await m.addMany(manyData);
  let ret = await m.limit([1,2]).select();
  t.is(ret.length,2);
});

test.serial('limit with two params', async t => {
  let m = new model(defaultTable, defaultOptions);
  await m.addMany(manyData);
  let ret = await m.limit([1],2).select();
  t.is(ret.length,2);
});

test.serial('limit with invalid offset and limit', async t => {
  let m = new model(defaultTable, defaultOptions);
  await m.addMany(manyData);
  let ret = await m.limit('t','j').select();
  t.is(ret.length,manyData.length);
});

test.serial('page', async t => {
  let m = new model(defaultTable, defaultOptions);
  await m.addMany(manyData);
  let ret = await m.page(1,2).select();
  t.is(ret.length,2);
  t.is(ret[0].version,manyData[0].version);
});

test.serial('page without pagesize params', async t => {
  let m = new model(defaultTable, defaultOptions);
  await m.addMany(manyData);
  let ret = await m.page([1,2]).select();
  t.is(ret.length,2);
  t.is(ret[0].version,manyData[0].version);
});

test.serial('page with array params', async t => {
  let m = new model(defaultTable, defaultOptions);
  await m.addMany(manyData);
  let ret = await m.page([1]).select();
  t.is(ret.length,2);
  t.is(ret[0].version,manyData[0].version);
});

test.serial('page with no params', async t => {
  let opt = Object.assign({},defaultOptions,{pagesize:null});
  let m = new model(defaultTable, opt);
  await m.addMany(manyData);
  let ret = await m.page().select();
  t.is(ret.length,manyData.length);
  t.is(ret[0].version,manyData[0].version);
});

//**?
// test.serial('table', async t => {
//   let m = new model(defaultTable, defaultOptions);
//   let otherTable = m.table('think');
//   await otherTable.addMany(manyData);
//   let ret = await otherTable.select();
//   t.is(ret.length,manyData.length)
// });

test.serial('order', async t => {
  let m = new model(defaultTable, defaultOptions);
  await m.addMany(manyData);
  let ret = await m.where({name:'thinkjs'}).order('version ASC').select();
  t.is(ret[0].version,'1.0')
});
