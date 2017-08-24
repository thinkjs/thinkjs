/*
* @Author: lushijie
* @Date:   2017-08-24 10:12:15
* @Last Modified by:   lushijie
* @Last Modified time: 2017-08-24 10:25:11
*/
const Sequelize = require('sequelize');

// const defaultOptions = {
//   logger: console.log.bind(console),
//   logConnect: true,
//   options: {
//     host: '127.0.0.1',
//     port: 3306,
//     dialect: 'mysql',
//   }
// };

function createConn (config) {
  const seqInst = new Sequelize('cdn_agent', 'root', 'root', {
    host: '127.0.0.1',
    dialect: 'mysql'
  });

  return seqInst;
}

module.exports = createConn;
