const {test} = require('node:test');
const mock = require('mock-require');
const Socket = require('../lib/socket');

test('socket config', t => {
  const socket = new Socket({ logger: 111 });
  t.assert.deepStrictEqual(socket.config, {
    logger: 111,
    logConnect: true,
    poolIdleTimeout: 8 * 60 * 60 * 1000
  });
});

test('socket pool', t => {
  t.plan(10);

  const defaultConfig = {
    logger(str) {
      t.assert.strictEqual(str, 'postgresql://root:root@127.0.0.1:3211/user');
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
      t.assert.strictEqual(config.logConnect, defaultConfig.logConnect);
      t.assert.strictEqual(config.poolIdleTimeout, defaultConfig.poolIdleTimeout);
      this.config = config;
    }
  };

  mock('pg', { Pool });
  const Socket = mock.reRequire('../lib/socket');
  const socket = new Socket(defaultConfig);
  t.assert.strictEqual(socket.pool instanceof Pool, true);
  socket.config = {};
  t.assert.strictEqual(Object.keys(socket.pool.config).length > 0, true);

  const Socket2 = mock.reRequire('../lib/socket');
  const socket2 = new Socket2({
    logger(str) {
      t.assert.strictEqual(str, 'hello world');
    },
    logConnect: true,
    connectionString: 'hello world'
  });
  t.assert.strictEqual(socket2.pool instanceof Pool, true);

  class Pool2 {
    constructor(config) {
      this.config = config;
    }
  };

  mock('pg', { Pool: Pool2 });
  const Socket3 = mock.reRequire('../lib/socket');
  const socket3 = new Socket3({
    logger() {
      t.assert.fail();
    },
    logConnect: false,
    connectionString: 'hello world'
  });
  t.assert.strictEqual(socket3.pool instanceof Pool2, true);
  mock.stopAll();
});

test('getConnection', async t => {
  t.plan(3);
  const socket = new Socket();
  t.assert.strictEqual(await socket.getConnection(2), 2);
  socket.pool.connect = function () {
    t.assert.ok(true);
    return 3;
  };
  t.assert.strictEqual(socket.getConnection(), 3);
});

test('startTrans', async t => {
  t.plan(3);

  const socket = new Socket();
  const defaultConnection = Promise.resolve(2);
  socket.query = async function (option, connection) {
    t.assert.deepStrictEqual(option, {
      sql: 'BEGIN',
      transaction: 1,
      debounce: false
    });
    t.assert.deepStrictEqual(connection, await defaultConnection);
  };
  const connection = await socket.startTrans(defaultConnection);
  t.assert.deepStrictEqual(connection, await defaultConnection);
});

test('commit', async t => {
  t.plan(3);

  const socket = new Socket();
  const defaultConnection = Promise.resolve(3);
  socket.query = function (option, connection) {
    t.assert.deepStrictEqual(option, {
      sql: 'COMMIT',
      transaction: 2,
      debounce: false
    });
    t.assert.deepStrictEqual(connection, defaultConnection);
    return 333;
  };
  t.assert.strictEqual(await socket.commit(defaultConnection), 333);
});

test('rollback', async t => {
  t.plan(3);

  const socket = new Socket();
  const defaultConnection = Promise.resolve(3);
  socket.query = function (option, connection) {
    t.assert.deepStrictEqual(option, {
      sql: 'ROLLBACK',
      transaction: 2,
      debounce: false
    });
    t.assert.deepStrictEqual(connection, defaultConnection);
    return 333;
  };
  t.assert.strictEqual(await socket.rollback(defaultConnection), 333);
});

test('transaction params check', async t => {
  try {
    const socket = new Socket();
    socket.transaction(1);
    t.assert.fail();
  } catch (e) {
    t.assert.strictEqual(e.message, 'fn must be a function');
  }
});

test('transaction', async t => {
  t.plan(4);

  const socket = new Socket();
  const defaultConnection = 'connection';
  const defaultFn = function (connection) {
    t.assert.deepStrictEqual(connection, defaultConnection);
    return 'lizheming';
  };
  socket.startTrans = socket.commit = function (connection) {
    t.assert.deepStrictEqual(connection, defaultConnection);
    return Promise.resolve(connection);
  };
  socket.rollback = function () {
    t.assert.fail();
  };
  const ret = await socket.transaction(defaultFn, defaultConnection);
  t.assert.strictEqual(ret, 'lizheming');
});

test('transaction with error', async t => {
  t.plan(5);

  const socket = new Socket();
  const defaultConnection = 'connection';
  const defaultFn = function (connection) {
    t.assert.deepStrictEqual(connection, defaultConnection);
    return 'lizheming';
  };
  socket.startTrans = function (connection) {
    t.assert.deepStrictEqual(connection, defaultConnection);
    return Promise.resolve(connection);
  };
  socket.commit = function (connection) {
    t.assert.deepStrictEqual(connection, defaultConnection);
    return Promise.reject(new Error('error'));
  };
  socket.rollback = function (connection) {
    t.assert.deepStrictEqual(connection, defaultConnection);
    return Promise.resolve();
  };

  try {
    await socket.transaction(defaultFn, defaultConnection);
  } catch (e) {
    t.assert.strictEqual(e.message, 'error');
  }
});

test('release connection', t => {
  const socket = new Socket();
  socket.releaseConnection({
    transaction: 1,
    release() {
      t.assert.fail();
    }
  });
  socket.releaseConnection({
    transaction: 2,
    release() {
      t.assert.ok(true);
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
  t.plan(4);

  const sqlOption1 = 'string sqloption';
  mock('think-debounce', class {
    debounce(key, fn) {
      t.assert.strictEqual(key, JSON.stringify({ sql: sqlOption1, debounce: true }));
      return fn();
    }
  });
  const defaultConnection = {
    query(sql, cb) {
      t.assert.strictEqual(sql, sqlOption1);
      return cb(null, sql);
    }
  };
  const Socket = mock.reRequire('../lib/socket');
  const socket = new Socket();
  socket.releaseConnection = function (connection) {
    t.assert.deepStrictEqual(connection, defaultConnection);
  };
  const ret = await socket.query(sqlOption1, defaultConnection);
  mock.stopAll();
  t.assert.strictEqual(ret, sqlOption1);
});

for (const fails of [false, true]) {
  test(`debounced queries release each checkout once on ${fails ? 'failure' : 'success'}`, async t => {
    const error = new Error('query failed');
    const calls = [];
    const released = [];
    const socket = new Socket({logConnect: false});
    const client = id => ({
      query(sql, callback) {
        calls.push(id);
        callback(fails ? error : null, sql);
      },
      release() {
        released.push(id);
      }
    });
    const leases = [client('first'), client('second')];
    socket.pool.connect = async () => leases.shift();

    const [first, second] = await Promise.allSettled([
      socket.query('SELECT 1'),
      socket.query('SELECT 1')
    ]);

    t.assert.deepStrictEqual(calls, ['first']);
    t.assert.deepStrictEqual(released.sort(), ['first', 'second']);
    const expected = fails
      ? {status: 'rejected', reason: error}
      : {status: 'fulfilled', value: 'SELECT 1'};
    t.assert.deepStrictEqual(first, expected);
    t.assert.deepStrictEqual(second, expected);
  });
}

for (const fails of [false, true]) {
  test(`transaction releases the checkout only after ${fails ? 'rollback' : 'commit'}`, async t => {
    const error = new Error('aborted transaction');
    const sql = fails ? 'SELECT 2' : 'SELECT 3';
    const calls = [];
    const socket = new Socket({logConnect: false});
    const client = {
      query(sql, callback) {
        calls.push(sql);
        callback(null, sql);
      },
      release() {
        calls.push('release');
      }
    };
    socket.pool.connect = async () => client;

    const transaction = socket.transaction(async connection => {
      t.assert.strictEqual(connection, client);
      await socket.query(sql, connection);
      t.assert.deepStrictEqual(calls, ['BEGIN', sql]);
      if (fails) throw error;
      return 'ok';
    });
    if (fails) await t.assert.rejects(transaction, error);
    else t.assert.strictEqual(await transaction, 'ok');
    t.assert.deepStrictEqual(calls, ['BEGIN', sql, fails ? 'ROLLBACK' : 'COMMIT', 'release']);
  });
}

test('query with object', async t => {
  t.plan(2);

  const sqlOption2 = {
    sql: 'hello world',
    debounce: false
  };
  mock('think-debounce', class {
    debounce() {
      t.assert.fail();
    }
  });
  const defaultConnection = {
    query(sql, cb) {
      t.assert.strictEqual(sql, sqlOption2.sql);
      return cb(null, sql);
    }
  };
  const Socket = mock.reRequire('../lib/socket');
  const socket = new Socket();
  socket.releaseConnection = function () { };
  const ret = await socket.query(sqlOption2, defaultConnection);
  mock.stopAll();
  t.assert.strictEqual(ret, sqlOption2.sql);
});

test('query with config debounce', async t => {
  t.plan(3);

  const sqlOption3 = {
    sql: 'hello world',
    transaction: 4
  };
  mock('think-debounce', class {
    debounce() {
      t.assert.fail();
    }
  });
  const defaultConnection = {
    query(sql, cb) {
      t.assert.strictEqual(sql, sqlOption3.sql);
      return cb(null, sql);
    }
  };
  const Socket = mock.reRequire('../lib/socket');
  const socket = new Socket({ debounce: false });
  socket.releaseConnection = function () { };
  const ret = await socket.query(sqlOption3, defaultConnection);
  mock.stopAll();
  t.assert.strictEqual(ret, sqlOption3.sql);
  t.assert.strictEqual(defaultConnection.transaction, 4);
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
      t.assert.fail();
    }
  };
  const socket = new Socket();
  const ret = await socket.query(sqlOption3, defaultConnection);
  t.assert.strictEqual(ret, undefined);
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
  t.assert.strictEqual(ret, sqlOption4.sql);
  t.assert.strictEqual(defaultConnection.transaction, 1);
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
    t.assert.strictEqual(connection, defaultConnection);
  };
  const ret = await socket.query(sqlOption5, defaultConnection);
  t.assert.strictEqual(ret, undefined);
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
  t.assert.strictEqual(ret, sqlOption6.sql);
  t.assert.strictEqual(defaultConnection.transaction, 2);
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
      t.assert.strictEqual(str, `SQL: ${sqlOption7.sql}, Time: 3ms`);
    }
  });
  try {
    await socket.query(sqlOption7, defaultConnection);
    t.assert.fail();
  } catch (e) {
    t.assert.strictEqual(e.message, 'this is string error');
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
      t.assert.strictEqual(str, `SQL: ${sqlOption7.sql}, Time: 3ms`);
    }
  });
  try {
    await socket.query(sqlOption7, defaultConnection);
    t.assert.fail();
  } catch (e) {
    t.assert.strictEqual(e.message, 'this is object error');
  }
});

test('excute', t => {
  t.plan(4);

  const socket = new Socket();
  socket.query = function (sqlOption, connection) {
    t.assert.deepStrictEqual(sqlOption, { sql: 'lizheming', debounce: false });
    t.assert.strictEqual(connection, 222);
    return 3;
  };
  t.assert.strictEqual(socket.execute('lizheming', 222), 3);

  socket.query = function (sqlOption) {
    t.assert.deepStrictEqual(sqlOption, { a: 1, b: 2, debounce: false });
  };
  socket.execute({ a: 1, b: 2, debounce: true });
});

test('close', t => {
  const socket = new Socket();
  socket.close({ end() { t.assert.ok(true) } });
});

test('close with null', t => {
  const socket = new Socket();
  Object.defineProperty(socket, 'pool', {
    get() {
      return {
        end() {
          t.assert.ok(true);
        }
      };
    }
  });
  socket.close();
});
