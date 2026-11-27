const {test} = require('node:test');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const {DatabaseSync} = require('node:sqlite');
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

test('socket execute & query with node:sqlite', async t => {
  const socket = createMemorySocket();

  try {
    await socket.execute('CREATE TABLE user (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)');

    const insert1 = await socket.execute("INSERT INTO user(name) VALUES ('alice')");
    const insert2 = await socket.execute("INSERT INTO user(name) VALUES ('bob')");
    const rows = await socket.query('SELECT id, name FROM user ORDER BY id ASC');

    t.assert.strictEqual(insert1.insertId > 0, true);
    t.assert.strictEqual(insert1.affectedRows, 1);
    t.assert.strictEqual(insert2.affectedRows, 1);
    t.assert.deepStrictEqual(rows, [
      {id: 1, name: 'alice'},
      {id: 2, name: 'bob'}
    ]);
  } finally {
    await socket.close();
  }
});

test('read results keep v2 row, BLOB and integer types', async t => {
  const socket = createMemorySocket();

  try {
    const rows = await socket.query([
      'SELECT 9223372036854775807 AS largeInteger, 1.5 AS fraction,',
      "X'00FF' AS blob, NULL AS missing"
    ].join(' '));

    t.assert.deepStrictEqual(rows, [{
      largeInteger: Number(9223372036854775807n),
      fraction: 1.5,
      blob: Buffer.from([0, 255]),
      missing: null
    }]);
  } finally {
    await socket.close();
  }
});

test('busy timeout keeps the v2 default and accepts a duration string', async t => {
  for (const [timeout, expected] of [[undefined, 5000], ['2s', 2000]]) {
    const socket = new Socket({path: true, timeout, logConnect: false});
    try {
      const rows = await socket.query('PRAGMA busy_timeout');
      t.assert.deepStrictEqual(rows, [{timeout: expected}]);
    } finally {
      await socket.close();
    }
  }
});

test('opens an existing SQLite file and persists committed changes', async t => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'think-model-sqlite-'));
  t.after(() => fs.rm(dir, {recursive: true, force: true}));

  const db = new DatabaseSync(path.join(dir, 'legacy.sqlite'));
  try {
    db.exec("CREATE TABLE item (id INTEGER PRIMARY KEY, name TEXT); INSERT INTO item VALUES (1, 'existing')");
  } finally {
    db.close();
  }

  const socket = new Socket({path: dir, database: 'legacy', logConnect: false});
  try {
    await socket.transaction(connection => socket.execute("INSERT INTO item VALUES (2, 'new')", connection));
  } finally {
    await socket.close();
  }

  const reopened = new DatabaseSync(path.join(dir, 'legacy.sqlite'));
  try {
    const rows = reopened.prepare('SELECT name FROM item ORDER BY id').all();
    t.assert.deepStrictEqual(rows.map(row => row.name), ['existing', 'new']);
  } finally {
    reopened.close();
  }
});

test('transaction rollback should keep data unchanged', async t => {
  const socket = createMemorySocket();

  try {
    await socket.execute('CREATE TABLE item (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)');

    let err;
    await t.assert.rejects(async () => {
      await socket.transaction(async connection => {
        await socket.execute("INSERT INTO item(name) VALUES ('rollback-me')", connection);
        throw new Error('mock failure');
      });
    }, caughtError => {
      err = caughtError;
      return true;
    });

    const rows = await socket.query('SELECT COUNT(1) AS cnt FROM item');
    t.assert.strictEqual(err.message, 'mock failure');
    t.assert.strictEqual(rows[0].cnt, 0);
  } finally {
    await socket.close();
  }
});

test('think-model integration', async t => {
  const userModel = new Model('user', {
    handle: SQLite,
    path: true,
    database: 'test',
    logConnect: false,
    debounce: false
  });

  await userModel.execute('CREATE TABLE user (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)');

  const insert1 = await userModel.add({name: 'alice'});
  const insert2 = await userModel.add({name: 'bob'});
  const rows = await userModel.select();

  t.assert.strictEqual(insert1, 1);
  t.assert.strictEqual(insert2, 2);
  t.assert.deepStrictEqual(rows, [
    {id: 1, name: 'alice'},
    {id: 2, name: 'bob'}
  ]);
});
