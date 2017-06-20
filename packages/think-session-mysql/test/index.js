const sessionMysql = require('../index');


try {
  const options = {
    host: '127.0.0.1',
    user: 'root',
    password: 'Hello@123',
    maxAge: 86400000,
    database:'think_test',
    tableName: 'think_session',
    cookie: '34588519-1a3b-4ecc-9dec-9932810c1bb9',
    fresh: false
  };
  let instance = new sessionMysql(options,{})
  instance.get('userId').then((res) => {
    console.log(res)
  })
} catch (e) {
  console.log(e);
}