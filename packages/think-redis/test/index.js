/*
* @Author: lushijie
* @Date:   2017-03-22 21:00:08
* @Last Modified by:   lushijie
* @Last Modified time: 2017-03-22 21:04:13
*/

const Redis = require('../index');


let config = {
  port: 6379,          // Redis port
  host: '127.0.0.1',   // Redis host
  password: '123456',
}

let redisInst = new Redis(config);
redisInst.set('name1', 'lushijie').then(data => {
  console.log('set data-->', data);
});
// redisInst.set('name2', 'lushijie');
// redisInst.set('name3', 'lushijie', 3);
// redisInst.set('name4', 'lushijie', 'EX', 5);
// redisInst.set('name5', 'lushijie', 'PX', 10000);

redisInst.get('name2').then(data => {
  console.log('get data-->', data);
  redisInst.close();
});

redisInst.delete('name1').then(data => {
  console.log('del data-->', data);
  redisInst.close();
});

// redisInst.on('ready', function() {
//   console.log('ready...')
// });

// redisInst.on('connect', function() {
//   console.log('connect...')
// });

// redisInst.on('error', function() {
//   console.log('error...')
// });

// redisInst.on('close', function() {
//   console.log('close...')
// });

// redisInst.on('reconnecting', function() {
//   console.log('reconnecting...')
// });

// redisInst.on('end', function() {
//   console.log('end...')
// });

