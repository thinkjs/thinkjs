const ava = require('ava');
const helper = require('think-helper');
const Base = require('../../lib/query');
const Parser = require('../../lib/parser');

ava.test('get instance', t => {
  const instance = new Base();
  t.is(instance.lastInsertId, 0);
});

ava.test('add data', async t => {
  const instance = new Base();
  Object.defineProperty(instance, 'parser', {
    value: new Parser()
  });
  instance.execute = function(sql) {
    this.lastSql = sql;
    return Promise.resolve(sql);
  };

  const data = await instance.add({
    name: 'lizheming',
    title: 'suredy',
    key: 1111
  }, {
    table: 'think_user'
  });
  t.is(instance.lastSql, "INSERT INTO think_user (name,title,key) VALUES ('lizheming','suredy',1111)");
});

ava.test('add many', async t => {
  const instance = new Base();
  Object.defineProperty(instance, 'parser', {
    value: new Parser()
  });
  instance.execute = function(sql) {
    this.lastSql = sql;
    return Promise.resolve(sql);
  };
  const data = await instance.addMany([{
    name: 'lizheming',
    title: 'suredy',
    key: 1111
  }, {
    name: 'lizheming2',
    title: 'suredy2',
    key: 222
  }], {
    table: 'think_user'
  });
  t.is(instance.lastSql, "INSERT INTO think_user(name,title,key) VALUES ('lizheming','suredy',1111),('lizheming2','suredy2',222)");
});

ava.test('select add', async t => {
  const instance = new Base();
  Object.defineProperty(instance, 'parser', {
    value: new Parser()
  });
  instance.execute = function(sql) {
    return Promise.resolve(sql);
  };
  const data = await instance.selectAdd('name,title', 'suredy', {
    table: 'think_other',
    where: {name: 'lizheming'},
    limit: 30
  });
  t.is(data, "INSERT INTO suredy (name,title) SELECT * FROM think_other WHERE ( name = 'lizheming' ) LIMIT 30");
});

ava.test('select add, fields is array', async t => {
  const instance = new Base();
  Object.defineProperty(instance, 'parser', {
    value: new Parser()
  });
  instance.execute = function(sql) {
    return Promise.resolve(sql);
  };
  const data = await instance.selectAdd(['name', 'title'], 'suredy', {
    table: 'think_other',
    where: {name: 'lizheming'},
    limit: 30
  });
  t.is(data, "INSERT INTO suredy (name,title) SELECT * FROM think_other WHERE ( name = 'lizheming' ) LIMIT 30");
});

ava.test('select add, options is empty', async t => {
  const instance = new Base();
  Object.defineProperty(instance, 'parser', {
    value: new Parser()
  });
  instance.execute = function(sql) {
    return Promise.resolve(sql);
  };
  const data = await instance.selectAdd(['name', 'title'], 'suredy');
  t.is(data, 'INSERT INTO suredy (name,title) SELECT * FROM ');
});

ava.test('delete', async t => {
  const instance = new Base();
  Object.defineProperty(instance, 'parser', {
    value: new Parser()
  });
  instance.execute = function(sql) {
    return Promise.resolve(sql);
  };
  const data = await instance.delete({
    table: 'think_user',
    where: {name: 'lizheming'},
    comment: 'lizheming'
  });
  t.is(data, "DELETE FROM think_user WHERE ( name = 'lizheming' ) /*lizheming*/");
});

ava.test('update', async t => {
  const instance = new Base();
  Object.defineProperty(instance, 'parser', {
    value: new Parser()
  });
  instance.execute = function(sql) {
    return Promise.resolve(sql);
  };
  const data = await instance.update({
    name: 'lizheming',
    title: 'title'
  }, {
    table: 'think_user',
    where: {name: 'lizheming'},
    comment: 'lizheming'
  });
  t.is(data, "UPDATE think_user SET name='lizheming',title='title' WHERE ( name = 'lizheming' ) /*lizheming*/");
});

ava.test('select', async t => {
  const instance = new Base();
  Object.defineProperty(instance, 'parser', {
    value: new Parser()
  });
  instance.query = function(sql) {
    return Promise.resolve(sql);
  };
  const data = await instance.select({
    table: 'think_user',
    where: {name: 'lizheming'},
    comment: 'lizheming'
  });
  t.is(data, "SELECT * FROM think_user WHERE ( name = 'lizheming' ) /*lizheming*/");
});

// cache removed 
// ava.test('select, cache', async t => {
//   let instance = new Base();
//   instance.query = function(sql){
//     return Promise.resolve(sql);
//   }
//   let data = await instance.select({
//     table: 'think_user',
//     where: {name: 'lizheming'},
//     comment: 'lizheming'
//   });
//   t.is(data, "SELECT * FROM think_user WHERE ( name = 'lizheming' ) /*lizheming*/");
// });

// ava.test('select, cache, with key', async t => {
//   let instance = new Base();
//   instance.query = function(sql){
//     return Promise.resolve(sql);
//   }
//   let data = await instance.select({
//     table: 'think_user',
//     where: {name: 'lizheming'},
//     comment: 'lizheming'
//   });
//   t.is(data, "SELECT * FROM think_user WHERE ( name = 'lizheming' ) /*lizheming*/");
// });

ava.test('select, string', async t => {
  const instance = new Base();
  instance.query = function(sql) {
    return Promise.resolve(sql);
  };
  const data = await instance.select("SELECT * FROM think_user WHERE ( name = 'lizheming' ) /*lizheming*/");
  t.is(data, "SELECT * FROM think_user WHERE ( name = 'lizheming' ) /*lizheming*/");
});
