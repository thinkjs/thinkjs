// import test from 'ava';
// const mock = require('mock-require');

const mysql = require('../index.js');
const instance = mysql.getInstance({
  user: 'root',
  password: 'root',
  database: 'test',
  logConnect: true,
  logSql: true,
  connectionLimit: 1
});

// let i = 1;

  // instance.getConnection().then(connection => {
  //   setInterval(() => {
  //     return instance.execute('SELECT * FROM aaa', connection).then(data => {
  //       console.log(data);
  //     }).catch(err => {
  //       console.log(err)
  //     })
  //   }, 1000)
  // })
  setInterval(() => {
    console.log('-------------------------------------')
    // instance.transaction(function(connection){
    //   return instance.execute('SELECT * FROM aaa', connection).then(data => {
    //     //console.log('test')
    //     //return instance.commit(connection);
    //     console.log(data)
    //   }).catch(err => {
    //     console.error(err, 'err');
    //   })
    // });
    //instance.getConnection().then(connection => {
      instance.query('SELECT * FROM aaa').catch(err => {
        console.log(err)
      });
      instance.query('SELECT id FROM aaa');
    //});
    // instance.getConnection().then(connection => {
    //   return instance.execute('SELECT * FROM aaa', connection);
    // })
    // instance.getConnection().then(connection => {
    //   return instance.execute('SELECT * FROM aaa', connection);
    // })
  }, 2000)



// function getSessionMysql() {
//   return mock.reRequire('../index');
// }


// const defaultConfig = {
//   port: 3306,
//   host: '127.0.0.1',
//   user: 'root',
//   password: 'Hello@123',
//   database: 'think_test',
// };

// const defaultConfig2 = {
//   port: 3306,
//   host: '127.0.0.1',
//   user: 'root',
//   password: 'Hell@123',
//   database: 'think_test',
// };

// test('constructor function --', async t => {
//   const SessionMysql = getSessionMysql();
//   let sm = new SessionMysql(defaultConfig);
//   // let sm2 = new SessionMysql(defaultConfig2);

//   // await sm.close();
//   let result = await sm.query('UPDATE session SET sd = 2');
//   console.log(result);

//   // console.log(sm === sm2);
//   // let result = await sm.query('SELECT * FROM session');
//   // console.log(result[0].id);
//   // let result1 = await sm.query('SELECT * FROM session');
//   // console.log(result1[0].id);
// });

// test('execute function --', async t => {
//   const SessionMysql = getSessionMysql();
//   let sm = new SessionMysql(defaultConfig);
//   let result = await sm.execute('UPDATE session SET expire=1491573228179 WHERE id=3');
//   console.log(result)
// });