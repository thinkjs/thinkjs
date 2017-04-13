const Mysql = require('../index');


const defaultConfig = {
  port: 3306,
  host: '127.0.0.1',
  user: 'root',
  password: 'Hello@123',
  database: 'think_test',
};

let mysql = new Mysql(defaultConfig);
let time = 1;

setInterval(()=>{
  mysql.query('UPDATE session SET isd = ' + time).then(result => {
    console.log(result);
    time ++;
  }).catch(err=>{
    console.log(err);
  });
},1000);