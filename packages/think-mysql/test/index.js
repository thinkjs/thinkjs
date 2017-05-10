import test from 'ava';
const helper = require('think-helper');
const mock = require('mock-require');


function getMysql() {
  return mock.reRequire('../index');
}
const config = {
  user: 'root',
  password: 'Hello@123',
  database: 'think_test',
  logConnect: true,
  logSql: true,
  connectionLimit: 1
};

test('constructor function', async t => {
  const mysql = getMysql();
  let instance = mysql.getInstance(config);
  let conn = await instance.getConnection();
  t.is(helper.isEmpty(instance.config),false);
  t.is(helper.isEmpty(instance.pool),false);
  t.is(helper.isEmpty(conn),false);
});

test('constructor function', async t => {
  // let conf = Object.assign(config,{socketPath:'/var/run/mysqld/mysqld.sock'});
  let conf = Object.assign({socketPath:'/tmp/mysql.sock'},config);
  const mysql = getMysql();
  let instance = mysql.getInstance(conf);
  let conn = await instance.getConnection();
  t.is(helper.isEmpty(instance.config),false);
  t.is(helper.isEmpty(instance.pool),false);
  t.is(helper.isEmpty(conn),false);
});

test('constructor function', async t => {
  let conf = Object.assign({},config);
  conf.logConnect = false;
  const mysql = getMysql();
  let instance = mysql.getInstance(conf);
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

test('query function', async t => {
  const mysql = getMysql();
  let instance = mysql.getInstance(config);

  await instance.execute(
    "insert into `think_test`.`books` (`name`, `author`) values ('thinkjs best practice', 'David')"
  );

  let books = await instance.query(
    'SELECT * FROM `books` WHERE `author` = "David"'
  );

  t.is(books[0].name,'thinkjs best practice');
});

test('query function', async t => {
  let conf = Object.assign({},config);
  conf.logSql = false;
  const mysql = getMysql();
  let instance = mysql.getInstance(conf);

  await instance.execute(
    "insert into `think_test`.`books` (`name`, `author`) values ('thinkjs best practice', 'David')"
  );

  let books = await instance.query(
    'SELECT * FROM `books` WHERE `author` = "David"'
  );

  t.is(books[0].name,'thinkjs best practice');
});

test('close function', async t => {
  const mysql = getMysql();
  let instance = mysql.getInstance(config);

  await instance.close();
  t.is(instance.pool._closed,true);
});

test('trans function', async t => {
  const mysql = getMysql();
  let instance = mysql.getInstance(config);

  let conn = instance.getConnection();
  await instance.startTrans(conn);
  let result = await instance.execute({
    sql:"insert into `think_test`.`books` (`name`, `author`) values ('thinkjs best practice', ?)",
    values:['0-David']
  },conn);
  result = await instance.execute({
    sql:"insert into `think_test`.`books` (`name`, `author`) values ('thinkjs best practice', ?)",
    values:[`${result.insertId}-David`]
  },conn);
  await instance.execute({
    sql:"insert into `think_test`.`books` (`name`, `author`) values ('this is a trans test', ?)",
    values:[`${result.insertId}-David`]
  },conn);
  await instance.commit(conn);

  result = await instance.query({
    sql:'SELECT * FROM `books` WHERE `author` = ?',
    values:[`${result.insertId}-David`]
  });
  t.is(result[0].name,'this is a trans test');
});

test('trans function', async t => {
  const mysql = getMysql();
  let instance = mysql.getInstance(config);

  let conn = instance.getConnection();
  await instance.startTrans(conn);
  let result = await instance.execute({
    sql:"insert into `think_test`.`books` (`name`, `author`) values ('thinkjs best practice', ?)",
    values:['0-David']
  },conn);
  result = await instance.execute({
    sql:"insert into `think_test`.`books` (`name`, `author`) values ('thinkjs best practice', ?)",
    values:[`${result.insertId}-David`]
  },conn);
  await instance.execute({
    sql:"insert into `think_test`.`books` (`name`, `author`) values ('this is a trans test', ?)",
    values:[`${result.insertId}-David`]
  },conn);
  await instance.rollback(conn);

  result = await instance.query({
    sql:'SELECT * FROM `books` WHERE `author` = ?',
    values:[`${result.insertId}-David`]
  });
  t.deepEqual([],result);
});

test('query function', async t => {
  const mysql = getMysql();
  let instance = mysql.getInstance(config);

  await instance.execute(
    "insert into `think_test`.`books` (`name`, `author`) values ('thinkjs best practice', 'David')"
  );

  let books = await instance.query(
    {
      sql:'SELECT * FROM `books` WHERE `author` = "David"',
      transaction:3
    }
  );

  t.is(books[0].name,'thinkjs best practice');
});

test('transaction function', async t => {
  const mysql = getMysql();
  let instance = mysql.getInstance(config);
  let result = null;
  await instance.transaction(async(conn) => {
    result = instance.execute({
      sql: "insert into `think_test`.`books` (`name`, `author`) values ('thinkjs best practice', ?)",
      values: ['0-David']
    }, conn);
    result = await instance.execute({
      sql: "insert into `think_test`.`books` (`name`, `author`) values ('this is a trans test', ?)",
      values: [`${result.insertId}-David`]
    }, conn);
    await instance.execute({
      sql: "insert into `think_test`.`books` (`name`, `author`) values ('this is a trans test', ?)",
      values: [`${result.insertId}-David`]
    }, conn);
  });
  result = await instance.query({
    sql: 'SELECT * FROM `books` WHERE `author` = ?',
    values: [`${result.insertId}-David`]
  });
  t.is(result[0].name, 'this is a trans test');
});

test('transaction function', async t => {
  const mysql = getMysql();
  let instance = mysql.getInstance(config);
  let result = null;
  try{
    await instance.transaction(async(conn) => {
      result = instance.execute({
        sql: "insert into `think_test`.`books` (`name`, `author`) values ('thinkjs best practice', ?)",
        values: ['0-David']
      }, conn);
      result = await instance.execute({
        sql: "insert into `think_test`.`books` (`name`, `author`) values ('this is a trans test', ?)",
        values: [`${result.insertId}-David`]
      }, conn);
      await instance.execute({
        sql: "insert into `think_test`.`books` (`name`, `autor`) values ('this is a trans test', ?)",
        values: [`${result.insertId}-David`]
      }, conn);
    });
  }catch (e){
    result = e;
  }
  t.is(result instanceof Error,true);
});

test('transaction function', async t => {
  const mysql = getMysql();
  let instance = mysql.getInstance(config);

  let conn = instance.getConnection();
  await instance.startTrans(conn);
  await instance.startTrans(conn);
  let result = await instance.execute({
    sql:"insert into `think_test`.`books` (`name`, `author`) values ('thinkjs best practice', ?)",
    values:['0-David']
  },conn);
  result = await instance.execute({
    sql:"insert into `think_test`.`books` (`name`, `author`) values ('thinkjs best practice', ?)",
    values:[`${result.insertId}-David`]
  },conn);
  await instance.execute({
    sql:"insert into `think_test`.`books` (`name`, `author`) values ('this is a trans test', ?)",
    values:[`${result.insertId}-David`]
  },conn);
  await instance.commit(conn);

  result = await instance.query({
    sql:'SELECT * FROM `books` WHERE `author` = ?',
    values:[`${result.insertId}-David`]
  });
  t.is(result[0].name,'this is a trans test');
});

test('transaction function', async t => {
  const mysql = getMysql();
  let instance = mysql.getInstance(config);
  let result = null;
  try{
    await instance.transaction(async(conn) => {
      result = instance.execute({
        sql: "insert into `think_test`.`books` (`name`, `author`) values ('thinkjs best practice', ?)",
        values: ['0-David']
      }, conn);
      result = await instance.execute({
        sql: "insert into `think_test`.`books` (`name`, `author`) values ('this is a trans test', ?)",
        values: [`${result.insertId}-David`]
      }, conn);
      conn.transaction = 2;
      await instance.execute({
        sql: "insert into `think_test`.`books` (`name`, `autor`) values ('this is a trans test', ?)",
        values: [`${result.insertId}-David`]
      }, conn);
    });
  }catch (e){
    result = e;
  }
  t.is(result instanceof Error,true);
});

test('transaction function', async t => {
  const mysql = getMysql();
  let instance = mysql.getInstance(config);
  let result = null;
  try{
    await instance.transaction(async(conn) => {
      conn.transaction = 3;
      result = instance.execute({
        sql: "insert into `think_test`.`books` (`name`, `author`) values ('thinkjs best practice', ?)",
        values: ['0-David']
      }, conn);
      result = await instance.execute({
        sql: "insert into `think_test`.`books` (`name`, `author`) values ('this is a trans test', ?)",
        values: [`${result.insertId}-David`]
      }, conn);
      await instance.execute({
        sql: "insert into `think_test`.`books` (`name`, `autor`) values ('this is a trans test', ?)",
        values: [`${result.insertId}-David`]
      }, conn);
    });
  }catch (e){
    result = e;
  }
  t.is(result instanceof Error,true);
});