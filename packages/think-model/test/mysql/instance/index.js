const ava = require('ava');
const helper = require('think-helper');
const Mysql = require('../../../src/mysql/instance/index');

ava.test('get instance', t => {
  let instance = new Mysql();
  t.is(instance.lastInsertId, 0);
});
ava.test('socket', t => {
  let instance = new Mysql();
  let socket = instance.socket();
  t.true(helper.isObject(socket));
});
ava.test('socket, exist', t => {
  let instance = new Mysql();
  let socket = instance.socket();
  let socket2 = instance.socket();
  t.is(socket, socket2);
});
ava.test('get fields', async t => {
  t.plan(2);
  
  let instance = new Mysql();
  instance.query = function(sql){
    t.is(sql, "SHOW COLUMNS FROM `user`");
    let data = [ { Field: 'id',    Type: 'int(11) unsigned',    Null: 'NO',    Key: 'PRI',    Default: null,    Extra: 'auto_increment' },  { Field: 'name',    Type: 'varchar(255)',    Null: 'NO',    Key: '',    Default: '',    Extra: '' },  { Field: 'title',    Type: 'varchar(255)',    Null: 'NO',    Key: '',    Default: '',    Extra: '' }   ];
    return Promise.resolve(data);
  }
  let data = await instance.getSchema('user');
  t.deepEqual(data, { id:  { name: 'id',    type: 'int(11) unsigned',    required: false,     primary: true,    unique: false,    auto_increment: true }, name:  { name: 'name',    type: 'varchar(255)',    required: false,       primary: false,    unique: false,    auto_increment: false }, title:  { name: 'title',    type: 'varchar(255)',    required: false,       primary: false,    unique: false,    auto_increment: false } });
});
ava.test('parseKey, empty', t => {
  let instance = new Mysql();
  let data = instance.parseKey();
  t.is(data, '');
});
ava.test('parseKey', t => {
  let instance = new Mysql();
  let data = instance.parseKey('test');
  t.is(data, '`test`');
});
ava.test('parseKey, has special chars', t => {
  let instance = new Mysql();
  let data = instance.parseKey('te"st');
  t.is(data, 'te"st');
});