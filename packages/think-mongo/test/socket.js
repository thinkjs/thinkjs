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

const connectionLimitConfig = {
  database: 'think_db',
  connectionLimit: 5
};
test.serial('pool size is config.connectionLimitConfig', async t => {
  const socket = Socket.getInstance(connectionLimitConfig);
  const pool = await socket.pool;
  t.is(pool.max, 5);
});

const poolSizeConfig = {
  database: 'think_db',
  connectionLimit: 5,
  options: {
    poolSize: 10
  }
};
test.serial('pool size is config.options.poolSize', async t => {
  const socket = Socket.getInstance(poolSizeConfig);
  const pool = await socket.pool;
  t.is(pool.max, 10);
});
