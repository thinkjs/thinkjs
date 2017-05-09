# think-mysql
[![Build Status](https://travis-ci.org/thinkjs/think-mysql.svg?branch=master)](https://travis-ci.org/thinkjs/think-mysql)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-mysql/badge.svg?branch=master)](https://coveralls.io/github/thinkjs/think-mysql?branch=master)
[![npm](https://img.shields.io/npm/v/think-mysql.svg?style=flat-square)](https://www.npmjs.com/package/think-mysql)

## Install

```
npm install think-mysql
```

## How to use

### default options

You can find all the config options at https://github.com/mysqljs/mysql#connection-options

```js
const defaultConfig = {
  port: 3306,
  host: '127.0.0.1',
  user: '',
  password: '',
  database: '',
  connectionLimit: 1,
  multipleStatements: true,
  logger: console.log.bind(console),
  logConnect: false,
  logSql: false
};
```

### Usage

#### Custom usage
```js
  import mysql from 'think-mysql';
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
  console.log(books[0].name)  //thinkjs best practice
```

#### Transactions

```js
  import mysql from 'think-mysql';
  let instance = mysql.getInstance(config);
  let result = null;
  try{
    await instance.transaction(async(conn) => {
      result = instance.execute({
        sql: "insert into `think_test`.`books` (`name`, `author`) values ('1st step', ?)",
        values: ['0-David']
      }, conn);
      result = await instance.execute({
        sql: "insert into `think_test`.`books` (`name`, `author`) values ('2nd step', ?)",
        values: [`${result.insertId}-David`]
      }, conn);
      await instance.execute({
        sql: "insert into `think_test`.`books` (`name`, `autor`) values ('3rd step', ?)",
        values: [`${result.insertId}-David`]
      }, conn);
    });
  }catch (e){
    console.log(e);
  }
  result = await instance.query({
      sql:'SELECT * FROM `books` WHERE `author` = ?',
      values:[`${result.insertId}-David`]
  });
  console.log(result[0].name);  //3rd step
```