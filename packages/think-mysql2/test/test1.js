const Mysql = require('../index');


const defaultConfig = {
  port: 3306,
  host: '127.0.0.1',
  user: 'root',
  password: 'Hello@123',
  database: 'think_test',
};

let mysql = new Mysql(defaultConfig);



setInterval(()=>{
  mysql.query('SELECT * FROM session').then(result => {
    console.log(result[0].id);
  }).catch(err=>{
    console.log(err);
  })
},1000);