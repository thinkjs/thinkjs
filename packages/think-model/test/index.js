const Model = require('../lib/mysql/relation');
const modelConfig = {
  database: 'firekylin13',
  prefix: 'fk_',
  encoding: 'utf8',
  nums_per_page: 10,
  host: '127.0.0.1',
  port: '',
  user: 'root',
  password: 'root'
};

function model(tableName) {
  return new Model(tableName, modelConfig);
}

let post = model('user');
post.where({id:1}).select().then(res => console.log(res)).catch(e => console.log(e));