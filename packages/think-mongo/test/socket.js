const test = require('ava');
const Socket = require('../src/socket');

const defaultConfig = {
  database: 'think_db',
}

test.serial('release', async t => {
  let socket = new Socket(defaultConfig);
  const pool = await socket.pool;
  t.is(!!pool,true);
  const connection = await socket.getConnection();
  t.is(!!connection,true);
  await socket.release(connection);
});

test.serial('close', async t => {
  let socket = new Socket(defaultConfig);
  const pool = await socket.pool;
  t.is(!!pool,true);
  const connection = await socket.getConnection();
  t.is(!!connection,true);
  let ret = await socket.close(connection);
});
