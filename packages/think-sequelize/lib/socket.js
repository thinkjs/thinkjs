/*
* @Author: lushijie
* @Date:   2017-08-24 10:12:15
* @Last Modified by:   lushijie
* @Last Modified time: 2018-01-06 14:49:00
*/
const Sequelize = require('sequelize');
const getInstance = require('think-instance');
const SEQUELIZE_CONN = Symbol('think-sequelize-connection');
const CONNECTION_STRING = Symbol('think-sequelize-connection-string');

// http://sequelize.readthedocs.io/en/latest/api/sequelize/#class-sequelize
const defaultOptions = {
  host: '127.0.0.1',
  port: 3306,
  dialect: 'mysql',
  operatorsAliases: Sequelize.Op,
  logging: function(sql) {
    /*eslint-disable */
    console.log.bind(console)(sql);
    /*eslint-enable */
  }
};

class Socket {
  constructor(config) {
    this.config = config;
    this.options = Object.assign({}, defaultOptions, this.config.options);
  }

  get [CONNECTION_STRING]() {
    const config = this.config;
    const options = this.options;
    let connectionString = config.connectionString;
    if (!connectionString) {
      let auth = '';
      // connect with auth
      if (config.user) {
        auth = `${config.user}:${config.password}@`;
      }
      connectionString = `${options.dialect}://${auth}${options.host}:${options.port}/${config.database}`;
    }
    return connectionString;
  }

  createConnection() {
    if (this[SEQUELIZE_CONN]) return this[SEQUELIZE_CONN];

    // config
    const config = this.config;
    const options = this.options;

    // connectionString
    const connectionString = this[CONNECTION_STRING];
    if (config.logConnect && options.logging) {
      options.logging(connectionString);
    }

    const sequelizeConn = new Sequelize(connectionString, options);
    this[SEQUELIZE_CONN] = sequelizeConn;
    return sequelizeConn;
  }
}

module.exports = getInstance(Socket);
