const test = require('ava');
const Socket = require('../src/socket');

const defaultConfig = {
  database: 'think_db'
};

test.serial('release', async t => {
  const socket = Socket.getInstance(defaultConfig);
  const pool = await socket.pool;
  t.is(!!pool, true);
  const connection = await socket.getConnection();
  t.is(!!connection, true);
  await socket.release(connection);
});

test.serial('close', async t => {
  const socket = Socket.getInstance(defaultConfig);
  const pool = await socket.pool;
  t.is(!!pool, true);
  const connection = await socket.getConnection();
  t.is(!!connection, true);
  const ret = await socket.close(connection);
});
