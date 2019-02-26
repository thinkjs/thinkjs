const mongodb = require('mongodb');
const genericPool = require('generic-pool');
const thinkInstance = require('think-instance');
const helper = require('think-helper');
const querystring = require('querystring');

const CREATE_POOL = Symbol('think-mongo-create-pool');
const POOL = Symbol('think-mongo-pool');

const mongoConnect = helper.promisify(mongodb.MongoClient.connect, mongodb.MongoClient);

const defaultOptions = {
  host: '127.0.0.1',
  port: 27017,
  logger: console.log.bind(console), /* eslint no-console: ["error", { allow: ["log"] }] */
  logConnect: true
};

class MongoSocket {
  constructor(config) {
    this.config = Object.assign({}, defaultOptions, config);
    if (this.config.logLevel) {
      mongodb.Logger.setLevel(this.config.logLevel);
    }
  }
  /**
   * get pool
   */
  get pool() {
    if (this[POOL]) return this[POOL];
    this[POOL] = this[CREATE_POOL]();
    return this[POOL];
  }
  /**
   * create pool
   */
  [CREATE_POOL]() {
    const factory = {
      create: () => {
        let auth = '';
        const config = this.config;
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
        const connectStr = `mongodb://${auth}${hostStr}/${config.database}${options}`;
        if (config.logConnect) {
          config.logger(connectStr);
        }
        return mongoConnect(connectStr);
      },
      destroy: client => {
        client.close();
        return Promise.resolve();
      }
    };

    let { connectionLimit, options } = this.config;
    if (options && (options.poolSize || options.maxPoolSize)) {
      connectionLimit = options.poolSize || options.maxPoolSize;
    }
    if (helper.isTrueEmpty(connectionLimit)) {
      connectionLimit = 5;
    }

    options = {
      min: 1,
      max: connectionLimit,
      acquireTimeoutMillis: this.config.acquireTimeoutMillis || 3000
    };
    return genericPool.createPool(factory, options);
  }
  /**
   * get connection
   */
  getConnection() {
    return this.pool.acquire();
  }
  /**
   * release connection
   * @param {Object} connection
   */
  release(connection) {
    this.pool.release(connection);
  }
  /**
   * auto release connection after run function
   * @param {Function} fn
   */
  autoRelease(fn) {
    return this.pool.acquire().then(connection => {
      return Promise.resolve(fn(connection)).then(data => {
        return { data, connection };
      }).catch(err => {
        this.pool.release(connection);
        throw err;
      });
    }).then(data => {
      this.pool.release(data.connection);
      return data.data;
    });
  }
  /**
   * close connection
   * @param {Object} connection
   */
  close(connection) {
    if (connection) return this.pool.destroy(connection);
    return this.pool.drain().then(() => {
      return this.pool.clear();
    }).then(() => {
      this[POOL] = null;
    });
  }
};

module.exports = thinkInstance(MongoSocket);
