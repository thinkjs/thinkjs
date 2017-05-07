import test from 'ava';
const helper = require('think-helper');
const mock = require('mock-require');
const mysql = require('../index.js');


function getMysql() {
  return mock.reRequire('../index');
}
let config = {
  user: 'root',
  password: '',
  database: 'think_test',
  logConnect: true,
  logSql: true,
  connectionLimit: 1
};

test.afterEach.always(_ => {
  // instance.close();
});

test('constructor function', async t => {
  const mysql = getMysql();
  let instance = mysql.getInstance(config);
  let conn = await instance.getConnection();
  t.is(helper.isEmpty(instance.config),false);
  t.is(helper.isEmpty(instance.pool),false);
  t.is(helper.isEmpty(conn),false);
});

test('constructor function', async t => {
  config.socketPath = '/tmp/mysql.sock';
  const mysql = getMysql();
  let instance = mysql.getInstance(config);
  let conn = await instance.getConnection();
  t.is(helper.isEmpty(instance.config),false);
  t.is(helper.isEmpty(instance.pool),false);
  t.is(helper.isEmpty(conn),false);
});

test('constructor function', async t => {
  config.logConnect = false;
  const mysql = getMysql();
  let instance = mysql.getInstance(config);
  let conn = await instance.getConnection();
  t.is(helper.isEmpty(instance.config),false);
  t.is(helper.isEmpty(instance.pool),false);
  t.is(helper.isEmpty(conn),false);
});

test('query function', async t => {
  const mysql = getMysql();
  let instance = mysql.getInstance(config);

  await instance.execute({
    sql:"insert into `think_test`.`books` (`name`, `author`) values ('thinkjs best practice', ?)",
    timeout: 5000,
    values: ['David']
  });

  let books = await instance.query({
    sql:'SELECT * FROM `books` WHERE `author` = ?',
    timeout: 5000,
    values: ['David']
  });

  t.is(books[0].name,'thinkjs best practice');
});