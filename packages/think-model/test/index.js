const ava = require('ava');
ava.todo('index');
// const path = require('path');
// const fileCache = require('think-cache-file');
// const Model = require('../lib/mysql');

// const modelConfig = {
//   database: 'firekylin13',
//   prefix: 'fk_',
//   encoding: 'utf8',
//   nums_per_page: 10,
//   host: '127.0.0.1',
//   port: '',
//   user: 'root',
//   password: 'root',
//   cache: {
//     type: 'file',
//     common: {
//       enable: true,
//       timeout: 24 * 60 * 60 * 1000, // millisecond
//     },
//     file: {
//       handle: fileCache,
//       cachePath: path.join(__dirname, 'runtime/cache'),  // absoulte path is necessarily required
//       pathDepth: 1,
//       gcInterval: 24 * 60 * 60 * 1000 // gc
//     }
//   }
// };

// function model(tableName) {
//   return new Model(tableName, modelConfig);
// }

// let post = model('user');
// post.where({id:1}).select().then(res => console.log(res)).catch(e => console.log(e));