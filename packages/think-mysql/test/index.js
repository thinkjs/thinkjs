import test from 'ava';
const helper = require('think-helper');
const mysql = require('../index.js');

const config = {
  user: 'root',
  password: '',
  database: 'think_test',
  logConnect: true,
  logSql: true,
  connectionLimit: 1
};
const instance = mysql.getInstance(config);

test('constructor function', async t => {
  let conn = await instance.getConnection();
  t.is(helper.isEmpty(instance.config),false);
  t.is(helper.isEmpty(instance.pool),false);
  t.is(helper.isEmpty(conn),false);
});