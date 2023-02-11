const mysql = require('mysql');
const helper = require('think-helper');
const assert = require('assert');
const Debounce = require('think-debounce');
const thinkInstance = require('think-instance');

const debug = require('debug')('think-mysql');
const debounceInstance = new Debounce();
const QUERY = Symbol('think-mysql-query');
const CONNECTION_LOST = Symbol('think-mysql-connection-lost');

const defaultConfig = {
  port: 3306,
  host: '127.0.0.1',
  user: '',
  password: '',
  database: '',
  connectionLimit: 1,
  logger: console.log.bind(console), /* eslint no-console: ["error", { allow: ["log"] }] */
  logConnect: false,
  logSql: false,
  acquireWaitTimeout: 0
};

/**
 * transaction status
 */
const TRANSACTION = {
  start: 1,
  end: 2
};

const TRANSACTIONS = Symbol('transactions');

class ThinkMysql {
  /**
   * @param  {Object} config [connection options]
   */
  constructor(config) {
    config = helper.extend({}, defaultConfig, config);
    this.config = config;
    this.maxRetryTimes = Math.max(config.connectionLimit + 1, 3);
    this.pool = mysql.createPool(helper.omit(config, 'logger,logConnect,logSql'));

    this.pool.on('acquire', connection => {
      debug(`acquire: Connection ${connection.threadId} acquired`);
    });
    this.pool.on('connection', () => {
      debug('connection: A new connection is made within the pool');
    });
    this.pool.on('enqueue', () => {
      debug('enqueue: Waiting for available connection slot');
    });
    this.pool.on('release', connection => {
      debug(`release: Connection ${connection.threadId} released`);
    });

    // log connect
    if (config.logConnect) {
      let connectionPath = '';
      if (config.socketPath) {
        connectionPath = config.socketPath;
      } else {
        connectionPath = `mysql://${config.user}:${config.password}@${config.host}:${config.port || 3306}/${config.database}`;
      }
      config.logger(connectionPath);
    }
  }
  /**
   * get connection
   */
  getConnection(connection) {
    if (connection && !connection[CONNECTION_LOST]) return Promise.resolve(connection);
    let promise;
    if (this.config.acquireWaitTimeout) {
      promise = new Promise((resolve, reject) => {
        this.pool.getConnection((err, connection) => {
          if (err) reject(err);
          else resolve(connection);
          clearTimeout(timer);
        });
        const timer = setTimeout(() => {
          const err = new Error('acquireWaitTimeout: ' + this.config.acquireWaitTimeout + 'ms');
          err.code = 'ACQUIRE_WAIT_TIMEOUT';
          reject(err);
        }, this.config.acquireWaitTimeout);
      });
    } else {
      promise = helper.promisify(this.pool.getConnection, this.pool)();
    }
    if (this.config.afterConnect) {
      return promise.then(connection => {
        return Promise.resolve(this.config.afterConnect(connection)).then(() => connection);
      });
    }
    return promise;
  }
  /**
   * start transaction
   * @param {Object} connection
   */
  startTrans(connection) {
    return this.getConnection(connection).then(connection => {
      if (connection[TRANSACTIONS] === undefined) {
        connection[TRANSACTIONS] = 0;
      }
      connection[TRANSACTIONS]++;
      if (connection[TRANSACTIONS] !== 1) return Promise.resolve();

      return this.query({
        sql: 'START TRANSACTION',
        transaction: TRANSACTION.start,
        debounce: false
      }, connection).then(() => connection);
    });
  }
  /**
   * commit transaction
   * @param {Object} connection
   */
  commit(connection) {
    if (connection && connection[TRANSACTIONS]) {
      connection[TRANSACTIONS]--;
      if (connection[TRANSACTIONS] !== 0) return Promise.resolve();
    }
    return this.query({
      sql: 'COMMIT',
      transaction: TRANSACTION.end,
      debounce: false
    }, connection);
  }
  /**
   * rollback transaction
   * @param {Object} connection
   */
  rollback(connection) {
    if (connection && connection[TRANSACTIONS]) {
      connection[TRANSACTIONS]--;
      if (connection[TRANSACTIONS] !== 0) return Promise.resolve();
    }
    return this.query({
      sql: 'ROLLBACK',
      transaction: TRANSACTION.end,
      debounce: false
    }, connection);
  }
  /**
   * transaction
   * @param {Function} fn
   * @param {Object} connection
   */
  transaction(fn, connection) {
    assert(helper.isFunction(fn), 'fn must be a function');
    return this.getConnection(connection).then(connection => {
      return this.startTrans(connection).then(() => {
        return fn(connection);
      }).then(data => {
        return this.commit(connection).then(() => data);
      }).catch(err => {
        return this.rollback(connection).then(() => Promise.reject(err));
      });
    });
  }
  /**
   * query data
   */
  [QUERY](sqlOptions, connection, startTime, times = 0) {
    const queryFn = helper.promisify(connection.query, connection);
    return queryFn(sqlOptions).catch(err => err).then(data => {
      this.releaseConnection(connection);

      // if server close connection, then retry it
      if (helper.isError(data) && data.code === 'PROTOCOL_CONNECTION_LOST') {
        connection[CONNECTION_LOST] = true;
        if (times < this.maxRetryTimes) {
          return this.getConnection().then(connection => {
            return this[QUERY](sqlOptions, connection, startTime, times + 1);
          });
        }
      }
      // log sql
      if (this.config.logSql) {
        const endTime = Date.now();
        this.config.logger(`SQL: ${sqlOptions.sql}, Time: ${endTime - startTime}ms`);
      }
      if (helper.isError(data)) {
        data.message += `, SQL: ${sqlOptions.sql}`;
        return Promise.reject(data);
      }
      return data;
    });
  }
  /**
   * release connection
   */
  releaseConnection(connection) {
    // if not in transaction, release connection
    if (connection.transaction !== TRANSACTION.start) {
      // connection maybe already released, it will throw an Error
      try {
        connection.release();
      } catch (e) {}
    }
  }
  /**
   * query({
   *  sql: 'SELECT * FROM `books` WHERE `author` = ?',
   *  timeout: 40000, // 40s
   *  values: ['David']
   * })
   * @param {Object} sqlOptions
   * @param {Object} connection
   */
  query(sqlOptions, connection) {
    if (helper.isString(sqlOptions)) {
      sqlOptions = {sql: sqlOptions};
    }
    if (sqlOptions.debounce === undefined) {
      if (this.config.debounce !== undefined) {
        sqlOptions.debounce = this.config.debounce;
      } else {
        sqlOptions.debounce = true;
      }
    }
    const startTime = Date.now();
    if (sqlOptions.debounce) {
      const key = JSON.stringify(sqlOptions);
      return debounceInstance.debounce(key, () => {
        return this.getConnection(connection).then(connection => {
          return this[QUERY](sqlOptions, connection, startTime);
        });
      });
    }
    return this.getConnection(connection).then(connection => {
      // set transaction status to connection
      if (sqlOptions.transaction) {
        if (sqlOptions.transaction === TRANSACTION.start) {
          if (connection.transaction === TRANSACTION.start) return;
        } else if (sqlOptions.transaction === TRANSACTION.end) {
          if (connection.transaction !== TRANSACTION.start) {
            this.releaseConnection(connection);
            return;
          }
        }
        connection.transaction = sqlOptions.transaction;
      }
      return this[QUERY](sqlOptions, connection, startTime);
    });
  }

  /**
   * execute
   * @param  {Array} args []
   * @returns {Promise}
   */
  execute(sqlOptions, connection) {
    if (helper.isString(sqlOptions)) {
      sqlOptions = {sql: sqlOptions};
    }
    sqlOptions.debounce = false;
    return this.query(sqlOptions, connection);
  }
  /**
   * close
   * @returns {Promise}
   */
  close() {
    return helper.promisify(this.pool.end, this.pool)();
  }
}
module.exports = thinkInstance(ThinkMysql);
