const { test } = require('ava');
const mock = require('mock-require');
const Socket = require('../lib/socket');

test('socket config', t => {
  const socket = new Socket({ logger: 111 });
  t.deepEqual(socket.config, {
    logger: 111,
    logConnect: true,
    poolIdleTimeout: 8 * 60 * 60 * 1000
  });
});

test('socket pool', t => {
  t.plan(10);

  const defaultConfig = {
    logger(str) {
      t.is(str, 'postgresql://root:root@127.0.0.1:3211/user');
    },
    user: 'root',
    password: 'root',
    host: '127.0.0.1',
    database: 'user',
    logConnect: true,
    poolIdleTimeout: 8 * 60 * 60 * 1000
  };

  class Pool {
    constructor(config) {
      t.is(config.logConnect, defaultConfig.logConnect);
      t.is(config.poolIdleTimeout, defaultConfig.poolIdleTimeout);
      this.config = config;
    }
  };

  mock('pg', { Pool });
  const Socket = mock.reRequire('../lib/socket');
  const socket = new Socket(defaultConfig);
  t.true(socket.pool instanceof Pool);
  socket.config = {};
  t.true(Object.keys(socket.pool.config).length > 0);

  const Socket2 = mock.reRequire('../lib/socket');
  const socket2 = new Socket2({
    logger(str) {
      t.is(str, 'hello world');
    },
    logConnect: true,
    connectionString: 'hello world'
  });
  t.true(socket2.pool instanceof Pool);

  class Pool2 {
    constructor(config) {
      this.config = config;
    }
  };

  mock('pg', { Pool: Pool2 });
  const Socket3 = mock.reRequire('../lib/socket');
  const socket3 = new Socket3({
    logger() {
      t.fail();
    },
    logConnect: false,
    connectionString: 'hello world'
  });
  t.true(socket3.pool instanceof Pool2);
  mock.stopAll();
});

test('getConnection', async t => {
  t.plan(3);
  const socket = new Socket();
  t.is(await socket.getConnection(2), 2);
  socket.pool.connect = function () {
    t.pass();
    return 3;
  };
  t.is(socket.getConnection(), 3);
});

test('startTrans', async t => {
  t.plan(3);

  const socket = new Socket();
  const defaultConnection = Promise.resolve(2);
  socket.query = async function (option, connection) {
    t.deepEqual(option, {
      sql: 'BEGIN',
      transaction: 1,
      debounce: false
    });
    t.deepEqual(connection, await defaultConnection);
  };
  const connection = await socket.startTrans(defaultConnection);
  t.deepEqual(connection, await defaultConnection);
});

test('commit', async t => {
  t.plan(3);

  const socket = new Socket();
  const defaultConnection = Promise.resolve(3);
  socket.query = function (option, connection) {
    t.deepEqual(option, {
      sql: 'COMMIT',
      transaction: 2,
      debounce: false
    });
    t.deepEqual(connection, defaultConnection);
    return 333;
  };
  t.is(await socket.commit(defaultConnection), 333);
});

test('rollback', async t => {
  t.plan(3);

  const socket = new Socket();
  const defaultConnection = Promise.resolve(3);
  socket.query = function (option, connection) {
    t.deepEqual(option, {
      sql: 'ROLLBACK',
      transaction: 2,
      debounce: false
    });
    t.deepEqual(connection, defaultConnection);
    return 333;
  };
  t.is(await socket.rollback(defaultConnection), 333);
});

test('transaction params check', async t => {
  try {
    const socket = new Socket();
    socket.transaction(1);
    t.fail();
  } catch (e) {
    t.is(e.message, 'fn must be a function');
  }
});

test('transaction', async t => {
  t.plan(4);

  const socket = new Socket();
  const defaultConnection = 'connection';
  const defaultFn = function (connection) {
    t.deepEqual(connection, defaultConnection);
    return 'lizheming';
  };
  socket.startTrans = socket.commit = function (connection) {
    t.deepEqual(connection, defaultConnection);
    return Promise.resolve(connection);
  };
  socket.rollback = function () {
    t.fail();
  };
  const ret = await socket.transaction(defaultFn, defaultConnection);
  t.is(ret, 'lizheming');
});

test('transaction with error', async t => {
  t.plan(5);

  const socket = new Socket();
  const defaultConnection = 'connection';
  const defaultFn = function (connection) {
    t.deepEqual(connection, defaultConnection);
    return 'lizheming';
  };
  socket.startTrans = function (connection) {
    t.deepEqual(connection, defaultConnection);
    return Promise.resolve(connection);
  };
  socket.commit = function (connection) {
    t.deepEqual(connection, defaultConnection);
    return Promise.reject(new Error('error'));
  };
  socket.rollback = function (connection) {
    t.deepEqual(connection, defaultConnection);
    return Promise.resolve();
  };

  try {
    await socket.transaction(defaultFn, defaultConnection);
  } catch (e) {
    t.is(e.message, 'error');
  }
});

test('release connection', t => {
  const socket = new Socket();
  socket.releaseConnection({
    transaction: 1,
    release() {
      t.fail();
    }
  });
  socket.releaseConnection({
    transaction: 2,
    release() {
      t.pass();
    }
  });
  socket.releaseConnection({
    transaction: 3,
    release() {
      throw new Error(333);
    }
  });
});

test('query', async t => {
  t.plan(5);

  const sqlOption1 = 'string sqloption';
  mock('think-debounce', class {
    debounce(key, fn) {
      t.is(key, JSON.stringify({ sql: sqlOption1, debounce: true }));
      return fn();
    }
  });
  const defaultConnection = {
    query(sql, cb) {
      t.is(sql, sqlOption1);
      return cb(null, sql);
    }
  };
  const Socket = mock.reRequire('../lib/socket');
  const socket = new Socket();
  socket.releaseConnection = function (connection) {
    t.deepEqual(connection, defaultConnection);
  };
  const ret = await socket.query(sqlOption1, defaultConnection);
  mock.stopAll();
  t.is(ret, sqlOption1);
});

test('query with object', async t => {
  t.plan(2);

  const sqlOption2 = {
    sql: 'hello world',
    debounce: false
  };
  mock('think-debounce', class {
    debounce() {
      t.fail();
    }
  });
  const defaultConnection = {
    query(sql, cb) {
      t.is(sql, sqlOption2.sql);
      return cb(null, sql);
    }
  };
  const Socket = mock.reRequire('../lib/socket');
  const socket = new Socket();
  socket.releaseConnection = function () { };
  const ret = await socket.query(sqlOption2, defaultConnection);
  mock.stopAll();
  t.is(ret, sqlOption2.sql);
});

test('query with config debounce', async t => {
  t.plan(3);

  const sqlOption3 = {
    sql: 'hello world',
    transaction: 4
  };
  mock('think-debounce', class {
    debounce() {
      t.fail();
    }
  });
  const defaultConnection = {
    query(sql, cb) {
      t.is(sql, sqlOption3.sql);
      return cb(null, sql);
    }
  };
  const Socket = mock.reRequire('../lib/socket');
  const socket = new Socket({ debounce: false });
  socket.releaseConnection = function () { };
  const ret = await socket.query(sqlOption3, defaultConnection);
  mock.stopAll();
  t.is(ret, sqlOption3.sql);
  t.is(defaultConnection.transaction, 4);
});

test('query with connection transaction start', async t => {
  const sqlOption3 = {
    sql: 'hello world',
    debounce: false,
    transaction: 1
  };

  const defaultConnection = {
    transaction: 1,
    query() {
      t.fail();
    }
  };
  const socket = new Socket();
  const ret = await socket.query(sqlOption3, defaultConnection);
  t.is(ret, undefined);
});

test('query with connection transaction null and sql transtart', async t => {
  t.plan(2);

  const sqlOption4 = {
    sql: 'hello world',
    debounce: false,
    transaction: 1
  };

  const defaultConnection = {
    query(sql, cb) {
      return cb(null, sql);
    }
  };
  const socket = new Socket();
  const ret = await socket.query(sqlOption4, defaultConnection);
  t.is(ret, sqlOption4.sql);
  t.is(defaultConnection.transaction, 1);
});

test('query with connection transaction null and sql transend', async t => {
  t.plan(2);

  const sqlOption5 = {
    sql: 'hello world',
    debounce: false,
    transaction: 2
  };

  const defaultConnection = {
    query(sql, cb) {
      return cb(null, sql);
    }
  };
  const socket = new Socket();
  socket.releaseConnection = function (connection) {
    t.is(connection, defaultConnection);
  };
  const ret = await socket.query(sqlOption5, defaultConnection);
  t.is(ret, undefined);
});

test('query with connection transaction start and sql transend', async t => {
  t.plan(2);

  const sqlOption6 = {
    sql: 'hello world',
    debounce: false,
    transaction: 2
  };

  const defaultConnection = {
    transaction: 1,
    query(sql, cb) {
      return cb(null, sql);
    }
  };
  const socket = new Socket();
  const ret = await socket.query(sqlOption6, defaultConnection);
  t.is(ret, sqlOption6.sql);
  t.is(defaultConnection.transaction, 2);
});

test('query with error', async t => {
  t.plan(2);

  const sqlOption7 = {
    sql: 'hello world',
    debounce: false
  };

  const defaultConnection = {
    query(sql, fn) {
      return fn('this is string error', null);
    }
  };

  let i = 0;
  Date.now = function () {
    if (i) {
      return 4;
    } else {
      i++;
      return 1;
    }
  };
  const socket = new Socket({
    logSql: true,
    logger(str) {
      t.is(str, `SQL: ${sqlOption7.sql}, Time: 3ms`);
    }
  });
  try {
    await socket.query(sqlOption7, defaultConnection);
    t.fail();
  } catch (e) {
    t.is(e.message, 'this is string error');
  }
});

test('query with error object', async t => {
  t.plan(2);

  const sqlOption7 = {
    sql: 'hello world',
    debounce: false
  };

  const defaultConnection = {
    query(sql, fn) {
      return fn(new Error('this is object error'), null);
    }
  };

  let i = 0;
  Date.now = function () {
    if (i) {
      return 4;
    } else {
      i++;
      return 1;
    }
  };
  const socket = new Socket({
    logSql: true,
    logger(str) {
      t.is(str, `SQL: ${sqlOption7.sql}, Time: 3ms`);
    }
  });
  try {
    await socket.query(sqlOption7, defaultConnection);
    t.fail();
  } catch (e) {
    t.is(e.message, 'this is object error');
  }
});

test('excute', t => {
  t.plan(4);

  const socket = new Socket();
  socket.query = function (sqlOption, connection) {
    t.deepEqual(sqlOption, { sql: 'lizheming', debounce: false });
    t.is(connection, 222);
    return 3;
  };
  t.is(socket.execute('lizheming', 222), 3);

  socket.query = function (sqlOption) {
    t.deepEqual(sqlOption, { a: 1, b: 2, debounce: false });
  };
  socket.execute({ a: 1, b: 2, debounce: true });
});

test('close', t => {
  const socket = new Socket();
  socket.close({ end() { t.pass() } });
});

test('close with null', t => {
  const socket = new Socket();
  Object.defineProperty(socket, 'pool', {
    get() {
      return {
        end() {
          t.pass();
        }
      };
    }
  });
  socket.close();
});
