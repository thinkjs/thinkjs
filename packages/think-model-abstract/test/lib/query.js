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

  await instance.add({
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
  await instance.addMany([{
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
  t.is(instance.lastSql, "INSERT INTO think_user (name,title,key) VALUES ('lizheming','suredy',1111),('lizheming2','suredy2',222)");
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

ava.test('query is function', async t => {
  const instance = new Base();
  t.is(helper.isFunction(instance.query), true);
});

ava.test('query 1', async t => {
  const instance = new Base();
  let flag = false;
  instance.socket = sql => {
    t.is(sql, 'SELECT * FROM user');
    t.is(instance.lastSql, 'SELECT * FROM user');
    return {
      query: (sqlOptions, connection) => {
        flag = true;
      }
    };
  };
  instance.query('SELECT * FROM user');
  t.is(flag, true);
});

ava.test('query 2', async t => {
  const instance = new Base();
  let flag = false;
  instance.socket = sql => {
    t.is(sql, 'SELECT * FROM user2');
    t.is(instance.lastSql, 'SELECT * FROM user2');
    return {
      query: (sqlOptions, connection) => {
        t.is(sqlOptions.a, 'b');
        flag = true;
      }
    };
  };
  instance.query({sql: 'SELECT * FROM user2', a: 'b'});
  t.is(flag, true);
});

ava.test('execute 1', async t => {
  const instance = new Base();
  let flag = false;
  instance.socket = sql => {
    t.is(sql, 'SELECT * FROM user');
    t.is(instance.lastSql, 'SELECT * FROM user');
    return {
      execute: (sqlOptions, connection) => {
        flag = true;
      }
    };
  };
  instance.execute('SELECT * FROM user');
  t.is(flag, true);
});

ava.test('execute 2', async t => {
  const instance = new Base();
  let flag = false;
  instance.socket = sql => {
    t.is(sql, 'SELECT * FROM user2');
    t.is(instance.lastSql, 'SELECT * FROM user2');
    return {
      execute: (sqlOptions, connection) => {
        t.is(sqlOptions.a, 'b');
        flag = true;
      }
    };
  };
  instance.execute({sql: 'SELECT * FROM user2', a: 'b'});
  t.is(flag, true);
});

ava.test('socket 1', async t => {
  const instance = new Base();
  const result = instance.socket('SQL', {
    getInstance: function() {
      return 1;
    }
  });
  t.is(result, 1);
});

ava.test('socket 2', async t => {
  const instance = new Base({
    c: 2,
    parser: function(sql) {
      t.is(sql, 'SQL');
      return {a: 'b'};
    }
  });
  const result = instance.socket('SQL', {
    getInstance: function(config) {
      t.is(config.a, 'b');
      t.is(config.c, 2);
      return 2;
    }
  });
  t.is(result, 2);
});

ava.test('socket 3', async t => {
  const instance = new Base({
    c: 2
  });
  const result = instance.socket('SQL', {
    getInstance: function(config) {
      t.is(config.c, 2);
      return 2;
    }
  });
  t.is(result, 2);

  const result2 = instance.socket('SQL');
  t.is(result2, 2);
});

ava.test('startTrans', async t => {
  const instance = new Base({});
  let flag = false;
  instance.socket = () => {
    return {
      startTrans: connection => {
        flag = true;
        return Promise.resolve(connection);
      }
    };
  };
  instance.startTrans({a: 1}).then(data => {
    t.is(instance.connection.a, 1);
    t.is(flag, true);
  });
});

ava.test('commit 1', async t => {
  const instance = new Base({});
  let flag = false;
  instance.socket = () => {
    return {
      commit: connection => {
        flag = true;
        t.is(connection.a, 1);
        return Promise.resolve(connection);
      }
    };
  };
  instance.commit({a: 1}).then(data => {
    t.is(flag, true);
  });
});

ava.test('commit 2', async t => {
  const instance = new Base({});
  let flag = false;
  instance.socket = () => {
    return {
      commit: connection => {
        flag = true;
        t.is(connection.a, 1);
        return Promise.resolve(connection);
      }
    };
  };
  instance.connection = {a: 1};
  instance.commit().then(data => {
    t.is(flag, true);
  });
});

ava.test('rollback 1', async t => {
  const instance = new Base({});
  let flag = false;
  instance.socket = () => {
    return {
      rollback: connection => {
        flag = true;
        t.is(connection.a, 1);
        return Promise.resolve(connection);
      }
    };
  };
  instance.rollback({a: 1}).then(data => {
    t.is(flag, true);
  });
});

ava.test('rollback 2', async t => {
  const instance = new Base({});
  let flag = false;
  instance.socket = () => {
    return {
      rollback: connection => {
        flag = true;
        t.is(connection.a, 1);
        return Promise.resolve(connection);
      }
    };
  };
  instance.connection = {a: 1};
  instance.rollback().then(data => {
    t.is(flag, true);
  });
});

ava.test('transaction 1', async t => {
  const instance = new Base({});
  let flag = false;
  instance.socket = () => {
    return {
      transaction: (fn, connection) => {
        flag = true;
        t.is(fn(), 1);
        return Promise.resolve(connection);
      }
    };
  };
  instance.transaction(function() {
    return 1;
  }).then(data => {
    t.is(flag, true);
  });
});