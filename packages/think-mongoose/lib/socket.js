const mongoose = require('mongoose');
const getInstance = require('think-instance');
const querystring = require('querystring');
const helper = require('think-helper');

const defaultOptions = {
  host: '127.0.0.1',
  port: 27017,
  logger: console.log.bind(console), /* eslint no-console: ["error", { allow: ["log"] }] */
  logConnect: true
};

const CONNECTION = Symbol('think-mongoose-connection');

class Socket {
  constructor(config) {
    this.config = Object.assign({}, defaultOptions, config);
  }
  createConnection() {
    if (this[CONNECTION]) return;
    this[CONNECTION] = true;

    const config = this.config;
    let connectionString = config.connectionString;
    if (!connectionString) {
      let auth = '';
      // connect with auth
      if (config.user) {
        auth = `${config.user}:${config.password}@`;
      }
      // connection options
      // http://mongodb.github.io/node-mongodb-native/2.0/tutorials/urls/
      let options = '';
      if (config.options) {
        options = '?' + querystring.stringify(config.options);
      }
      // many hosts
      let hostStr = '';
      if (helper.isArray(config.host)) {
        hostStr = config.host.map((item, i) => {
          return `${item}:${(config.port[i] || config.port[0])}`;
        }).join(',');
      } else {
        hostStr = config.host + ':' + config.port;
      }
      connectionString = `mongodb://${auth}${hostStr}/${config.database}${options}`;
    }

    if (config.logConnect) {
      config.logger(connectionString);
    }
    const opts = config.options || {};
    opts.useMongoClient = true;
    mongoose.connect(connectionString, opts);
  }
}

module.exports = getInstance(Socket);
