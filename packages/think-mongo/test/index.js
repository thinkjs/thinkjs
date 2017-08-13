const test = require('ava');
const model = require('../src/model');


const defaultOptions = {
  database: 'think_db'
};

test('add data', async t => {
  let m = new model('test', defaultOptions);
  let insertId = await m.add({name: 'thinkjs'});
  t.is(!!insertId, true);
});

test('query data', async t => {
  let m = new model('test', defaultOptions);
  let data = {name:'query data'};
  await m.add(data);
  let ret = await m.where(data).find();
  t.is(ret.name,data.name);
});