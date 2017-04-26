# think-mysql

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
  user: 'root',
  password: '',
  connectionLimit: 5
};
```

### Usage and feature

#### Singleton

If your aplication use the same db config, think-mysql will return the last one instance.

#### Custom usage
```js
import ThinkMysql from 'think-mysql';
const config = {
    port: 3306,
    host: '127.0.0.1',
    user: 'root',
    password: 'test',
    database: 'think_test',
  };
  const mysql = new ThinkMysql(config);
  let result = await mysql.execute('INSERT INTO table1 (name) VALUES(?)','thinkjs');
  console.log(`insert id is:${result.insertId}`);
  result = await mysql.query('SELECT * FROM table1 WHERE id=?',result.insertId);
  console.log(`item name is ${result[0].name}`);
```

#### Transactions
Transactions operation also be supported via executeTrans function, an array param need(string or object array).
Transactions will execute one by one from then array items.If you pass an object Array item,`cb` will call after the `sql` executed,
`params` means you can pass either an escaping params or an unknown params which the result from before sqls.Finally 
`executeTrans` will return an Array which wrap all the results.

```js
  import ThinkMysql from 'think-mysql';
  const config = {
    port: 3306,
    host: '127.0.0.1',
    user: 'root',
    password: 'test',
    database: 'think_test',
  };
  // let obj = ['INSERT INTO table1 (name) VALUES("test")','SELECT * FROM table1',];
  let obj = [
    {
      sql:'INSERT INTO table1 (name) VALUES("test")',
      cb:(results)=>{
      }
    },
    {
      sql:'INSERT INTO table2 (table1_id) VALUES(?)',
      params:(results)=>{
        // use the insertId from the before the last result
        return [results[0].insertId];
      },
      cb: (results) => {
      }
    },
    {
      sql: 'INSERT INTO table3 (table1_id,table2_id) VALUES(?,?)',
      params:(results)=>{
        return [results[0].insertId,results[1].insertId];
      },
      cb: (results) => {
        console.log('first insert id is ：' + results[0].insertId);
        console.log('second insert id is ：' + results[1].insertId);
        console.log('last insert id is ：' + results[2].insertId);
      }
    }
  ];
  const mysql = new ThinkMysql(config);
  let results = await mysql.executeTrans(obj);
  console.log(results);
```