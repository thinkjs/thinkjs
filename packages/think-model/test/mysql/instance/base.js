const ava = require('ava');
const helper = require('think-helper');
const Base = require('../../../src/mysql/instance/base');

ava.test('get instance', t => {
  let instance = new Base();
  t.is(instance.sql, '');
  t.is(instance.lastInsertId, 0);
  t.is(instance._socket, null);
});

ava.test('socket is function', t => {
  t.plan(2);

  let instance = new Base();
  let socket = instance.socket();
  t.true(helper.isFunction(instance.socket));
  t.is(socket, undefined);
});

ava.test('add data', async t => {
  let instance = new Base();
  instance.execute = function(sql){
    return Promise.resolve(sql);
  }

  let data = await instance.add({
    name: 'lizheming',
    title: 'suredy',
    key: 1111
  }, {
    table: 'think_user',
  });
  t.is(data, "INSERT INTO think_user (name,title,key) VALUES ('lizheming','suredy',1111)");
});

ava.test('replace data', async t => {
  let instance = new Base();
  instance.execute = function(sql){
    return Promise.resolve(sql);
  }
  let data = await instance.add({
    name: 'lizheming',
    title: 'suredy',
    key: 1111
  }, {
    table: 'think_user',
  }, true);
  t.is(data, "REPLACE INTO think_user (name,title,key) VALUES ('lizheming','suredy',1111)");
});

ava.test('replace data, ignore some data', async t => {
  let instance = new Base();
  instance.execute = function(sql){
    return Promise.resolve(sql);
  }
  let data = await instance.add({
    name: 'lizheming',
    title: 'suredy',
    key: 1111,
    test: ['suredy']
  }, {
    table: 'think_user',
  }, true);
  t.is(data, "REPLACE INTO think_user (name,title,key) VALUES ('lizheming','suredy',1111)");
});

ava.test('add many', async t => {
  let instance = new Base();
  instance.execute = function(sql){
    return Promise.resolve(sql);
  }
  let data = await instance.addMany([{
    name: 'lizheming',
    title: 'suredy',
    key: 1111
  },{
    name: 'lizheming2',
    title: 'suredy2',
    key: 222
  }], {
    table: 'think_user',
  });
  t.is(data, "INSERT INTO think_user(name,title,key) VALUES ('lizheming','suredy',1111),('lizheming2','suredy2',222)");
});

ava.test('add many, replace', async t => {
  let instance = new Base();
  instance.execute = function(sql){
    return Promise.resolve(sql);
  }
  let data = await instance.addMany([{
    name: 'lizheming',
    title: 'suredy',
    key: 1111
  },{
    name: 'lizheming2',
    title: 'suredy2',
    key: 222
  }], {
    table: 'think_user',
  }, true);
  t.is(data, "REPLACE INTO think_user(name,title,key) VALUES ('lizheming','suredy',1111),('lizheming2','suredy2',222)");
});

ava.test('add many, ignore some data', async t => {
  let instance = new Base();
  instance.execute = function(sql){
    return Promise.resolve(sql);
  }
  let data = await instance.addMany([{
    name: 'lizheming',
    title: 'suredy',
    key: 1111
  },{
    name: 'lizheming2',
    title: 'suredy2',
    key: 222,
    test: ['suredy']
  }], {
    table: 'think_user',
  }, true);
  t.is(data, "REPLACE INTO think_user(name,title,key) VALUES ('lizheming','suredy',1111),('lizheming2','suredy2',222)");
});

ava.test('select add', async t => {
  let instance = new Base();
  instance.execute = function(sql){
    return Promise.resolve(sql);
  }
  let data = await instance.selectAdd('name,title', 'suredy', {
    table: 'think_other',
    where: {name: 'lizheming'},
    limit: 30
  });
  t.is(data, "INSERT INTO suredy (name,title) SELECT * FROM think_other WHERE ( name = 'lizheming' ) LIMIT 30");
});

ava.test('select add, fields is array', async t => {
  let instance = new Base();
  instance.execute = function(sql){
    return Promise.resolve(sql);
  }
  let data = await instance.selectAdd(['name', 'title'], 'suredy', {
    table: 'think_other',
    where: {name: 'lizheming'},
    limit: 30
  });
  t.is(data, "INSERT INTO suredy (name,title) SELECT * FROM think_other WHERE ( name = 'lizheming' ) LIMIT 30");
});

ava.test('select add, options is empty', async t => {
  let instance = new Base();
  instance.execute = function(sql){
    return Promise.resolve(sql);
  }
  let data = await instance.selectAdd(['name', 'title'], 'suredy');
  t.is(data, "INSERT INTO suredy (name,title) SELECT * FROM ");
});

ava.test('delete', async t => {
  let instance = new Base();
  instance.execute = function(sql){
    return Promise.resolve(sql);
  }
  let data = await instance.delete({
    table: 'think_user',
    where: {name: 'lizheming'},
    comment: 'lizheming'
  });
  t.is(data, "DELETE FROM think_user WHERE ( name = 'lizheming' ) /*lizheming*/");
});

ava.test('update', async t => {
  let instance = new Base();
  instance.execute = function(sql){
    return Promise.resolve(sql);
  }
  let data = await instance.update({
    name: 'lizheming',
    title: 'title'
  },{
    table: 'think_user',
    where: {name: 'lizheming'},
    comment: 'lizheming'
  });
  t.is(data, "UPDATE think_user SET name='lizheming',title='title' WHERE ( name = 'lizheming' ) /*lizheming*/");
});

ava.test('select', async t => {
  let instance = new Base();
  instance.query = function(sql){
    return Promise.resolve(sql);
  }
  let data = await instance.select({
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
  let instance = new Base();
  instance.query = function(sql){
    return Promise.resolve(sql);
  }
  let data = await instance.select("SELECT * FROM think_user WHERE ( name = 'lizheming' ) /*lizheming*/");
  t.is(data, "SELECT * FROM think_user WHERE ( name = 'lizheming' ) /*lizheming*/");
});

ava.test('escapeString, empty', t => {
  let instance = new Base();
  let data = instance.escapeString();
  t.is(data, '');
});

ava.test('escapeString, \\n', t => {
  let instance = new Base();
  let data = instance.escapeString('\n');
  t.is(data, '\\n');
});

ava.test('escapeString, \\0', t => {
  let instance = new Base();
  let data = instance.escapeString('\0');
  t.is(data, '\\0');
});

ava.test('escapeString, \\r', t => {
  let instance = new Base();
  let data = instance.escapeString('\r');
  t.is(data, '\\r');
});

ava.test('escapeString, \\b', t => {
  let instance = new Base();
  let data = instance.escapeString('\b');
  t.is(data, '\\b');
});

ava.test('escapeString, \\t', t => {
  let instance = new Base();
  let data = instance.escapeString('\t');
  t.is(data, '\\t');
});

ava.test('escapeString, \\Z', t => {
  let instance = new Base();
  let data = instance.escapeString('\u001a');
  t.is(data, '\\Z');
});

ava.test('escapeString, \\"', t => {
  let instance = new Base();
  let data = instance.escapeString('"');
  t.is(data, '\\"');
});

ava.test('query', async t => {
  t.plan(2);

  let instance = new Base();
  instance.socket = t => {
    return {
      query: function(sql){
        return Promise.resolve(sql);
      }
    }
  }
  let data = await instance.query('SELECT * FROM think_user');
  t.is(data, 'SELECT * FROM think_user');
  t.is(instance.getLastSql(), 'SELECT * FROM think_user');
});

ava.test('execute', async t => {
  t.plan(2);

  let instance = new Base();
  instance.socket = t => {
    return {
      execute: function(sql){
        return Promise.resolve({
          insertId: 1000,
          affectedRows: 10
        });
      }
    }
  }
  let data = await instance.execute('DELETE FROM think_user');
  t.is(data, 10);
  t.is(instance.getLastInsertId(), 1000);
});

ava.test('execute, empty return', async t => {
  t.plan(2);

  let instance = new Base();
  instance.socket = t => {
    return {
      execute: function(sql){
        return Promise.resolve({
        });
      }
    }
  }
  let data = await instance.execute('DELETE FROM think_user');
  t.is(data, 0);
  t.is(instance.getLastInsertId(), 0);
});

ava.test('bufferToString', t => {
  let instance = new Base({bufferToString: true});
  let data = instance.bufferToString([{name: new Buffer('lizheming'), title: 'sss'}]);
  t.deepEqual(data, [{name: 'lizheming', title: 'sss'}]);
});

ava.test('close', t => {
  let instance = new Base({bufferToString: true});
  let flag = false;
  instance._socket = {
    close: t => {
      flag = true;
    }
  }
  instance.close();
  t.is(flag, true);
});

ava.test('close', t => {
  let instance = new Base({bufferToString: true});
  let flag = false;
  instance.close();
  t.is(flag, false);
});

// ava.test('startTrans', async t => {
//   let instance = new Base();
//   let flag = false;
//   instance.execute = function(sql){
//     t.is(sql, 'START TRANSACTION');
//     flag = true;
//     return Promise.resolve();
//   }
//   let data = await instance.startTrans();
//   t.is(flag, true);
//   instance.transTimes = 1;
// });

// ava.test('startTrans, is started', async t => {
//   let instance = new Base();
//   instance.transTimes = 1;
//   let flag = false;
//   instance.execute = function(sql){
//     t.is(sql, 'START TRANSACTION');
//     flag = true;
//     return Promise.resolve();
//   }
//   let data = await instance.startTrans();
//   t.is(flag, false);
//   instance.transTimes = 1;
// });

// ava.test('commit, not start', async t => {
//   let instance = new Base();
//   let flag = false;
//   instance.execute = function(sql){
//     t.is(sql, 'ROLLBACK');
//     flag = true;
//     return Promise.resolve();
//   }
//   let data = await instance.commit();
//   t.false(flag);
//   instance.transTimes = 0;
// });

// ava.test('commit', async t => {
//   let instance = new Base();
//   instance.transTimes = 1;
//   let flag = false;
//   instance.execute = function(sql){
//     t.is(sql, 'COMMIT');
//     flag = true;
//     return Promise.resolve();
//   }
//   let data = await instance.commit();
//   t.true(flag);
//   instance.transTimes = 0;
// });

// ava.test('rollback, not start', async t => {
//   let instance = new Base();
//   let flag = false;
//   instance.execute = function(sql){
//     t.is(sql, 'ROLLBACK');
//     flag = true;
//     return Promise.resolve();
//   }
//   let data = await instance.rollback();
//   t.false(flag);
//   instance.transTimes = 0;
// });

// ava.test('rollback', async t => {
//   let instance = new Base();
//   instance.transTimes = 1;
//   let flag = false;
//   instance.execute = function(sql){
//     t.is(sql, 'ROLLBACK');
//     flag = true;
//     return Promise.resolve();
//   }
//   let data = await instance.rollback();
//   t.true(flag);
//   instance.transTimes = 0;
// });