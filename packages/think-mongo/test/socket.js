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

test.serial('default value of pool size is 5', async t => {
  const socket = Socket.getInstance(defaultConfig);
  const pool = await socket.pool;
  t.is(pool.max, 5);
});

const connectionLimitConfig = {
  database: 'think_db',
  connectionLimit: 10,
  options: {
    maxPoolSize: 15,
    poolSize: 20
  }
};

test.serial('pool size is config.connectionLimitConfig', async t => {
  const socket = Socket.getInstance(connectionLimitConfig);
  const pool = await socket.pool;
  t.is(pool.max, 10);
});

const maxPoolSizeConfig = {
  database: 'think_db',
  options: {
    maxPoolSize: 15
  }
};

test.serial('pool size is config.options.maxPoolSize', async t => {
  const socket = Socket.getInstance(maxPoolSizeConfig);
  const pool = await socket.pool;
  t.is(pool.max, 15);
});

const poolSizeConfig = {
  database: 'think_db',
  options: {
    maxPoolSize: 15,
    poolSize: 20
  }
};
test.serial('pool size is config.options.poolSize', async t => {
  const socket = Socket.getInstance(poolSizeConfig);
  const pool = await socket.pool;
  t.is(pool.max, 20);
});
