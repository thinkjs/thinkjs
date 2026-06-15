const {default: test} = require('ava');
const Model = require('think-model/lib/model');
const SQLite = require('../');

const Socket = require('../lib/socket');

function createMemorySocket() {
  return new Socket({
    path: ':memory:',
    database: 'test',
    logConnect: false,
    debounce: false
  });
}

test('socket execute & query with better-sqlite3', async t => {
  const socket = createMemorySocket();

  try {
    await socket.execute('CREATE TABLE user (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)');

    const insert1 = await socket.execute("INSERT INTO user(name) VALUES ('alice')");
    const insert2 = await socket.execute("INSERT INTO user(name) VALUES ('bob')");
    const rows = await socket.query('SELECT id, name FROM user ORDER BY id ASC');

    t.true(insert1.insertId > 0);
    t.is(insert1.affectedRows, 1);
    t.is(insert2.affectedRows, 1);
    t.deepEqual(rows, [
      {id: 1, name: 'alice'},
      {id: 2, name: 'bob'}
    ]);
  } finally {
    await socket.close();
  }
});

test('transaction rollback should keep data unchanged', async t => {
  const socket = createMemorySocket();

  try {
    await socket.execute('CREATE TABLE item (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)');

    const err = await t.throwsAsync(async () => {
      await socket.transaction(async connection => {
        await socket.execute("INSERT INTO item(name) VALUES ('rollback-me')", connection);
        throw new Error('mock failure');
      });
    });

    const rows = await socket.query('SELECT COUNT(1) AS cnt FROM item');
    t.is(err.message, 'mock failure');
    t.is(rows[0].cnt, 0);
  } finally {
    await socket.close();
  }
});

test('think-model integration', async t => {
  const userModel = new Model('user', {
    handle: SQLite,
    path: '/tmp',
    database: 'test',
    logConnect: false,
    debounce: false
  });

  await userModel.execute('CREATE TABLE user (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)');

  const insert1 = await userModel.add({name: 'alice'});
  const insert2 = await userModel.add({name: 'bob'});
  const rows = await userModel.select();

  t.is(insert1, 1);
  t.is(insert2, 2);
  t.deepEqual(rows, [
    {id: 1, name: 'alice'},
    {id: 2, name: 'bob'}
  ]);
});
