import test from 'ava';
const mock = require('mock-require');


function getSessionMysql() {
  return mock.reRequire('../index');
}


const defaultConfig = {
  port: 3306,
  host: '127.0.0.1',
  user: 'root',
  password: 'Hello@123',
  database:'think_test',
  // connectionLimit:5
};

test('constructor function --', t => {
  const SessionMysql = getSessionMysql();
  let sm = new SessionMysql(defaultConfig);
  sm.getConnection().then((conn) => {
    console.log(conn)
  });
});