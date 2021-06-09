const thinkInstance = require('think-instance');
const { Pool } = require('pg');
const assert = require('assert');
const helper = require('think-helper');
const Debounce = require('think-debounce');

const debounceInstance = new Debounce();

const QUERY = Symbol('think-postgresql-query');
const POOL = Symbol('think-postgresql-pool');

const defaultOptions = {
  logger: console.log.bind(console), /* eslint no-console: ["error", { allow: ["log"] }] */
  logConnect: true,
  poolIdleTimeout: 8 * 60 * 60 * 1000
};

/**
 * transaction status
 */
const TRANSACTION = {
  start: 1,
  end: 2
};

class PostgreSQLSocket {
  constructor(config = {}) {
    this.config = Object.assign({}, defaultOptions, config);
  }
  /**
   * get pool instance
   */
  get pool() {
    if (this[POOL]) return this[POOL];
    this[POOL] = new Pool(this.config);

    // log connect
    const config = this.config;
    if (config.logConnect) {
      let connectionString = config.connectionString;
      if (!connectionString) {
        connectionString = `postgresql://${config.user}:${config.password}@${config.host}:${config.port || 3211}/${config.database}`;
      }
      this.config.logger(connectionString);
    }
    return this[POOL];
  }
  /**
   * get connection
   */
  getConnection(connection) {
    if (connection) return Promise.resolve(connection);
    return this.pool.connect();
  }
  /**
   * start transaction
   * @param {Object} connection
   */
  startTrans(connection) {
    return this.getConnection(connection).then(connection => {
      return this.query({
        sql: 'BEGIN',
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
   * release connection
   * @param {Object} connection
   */
  releaseConnection(connection) {
    // if not in transaction, release connection
    if (connection.transaction !== TRANSACTION.start) {
      // connection maybe already released, so and try for it
      try {
        connection.release();
      } catch (e) { }
    }
  }
  /**
   * query data
   */
  [QUERY](sqlOptions, connection, startTime) {
    const query = helper.promisify(connection.query, connection);
    return query(sqlOptions.sql).catch(err => {
      return helper.isError(err) ? err : new Error(err);
    }).then(data => {
      // log sql
      if (this.config.logSql) {
        const endTime = Date.now();
        this.config.logger(`SQL: ${sqlOptions.sql}, Time: ${endTime - startTime}ms`);
      }
      this.releaseConnection(connection);

      if (helper.isError(data)) return Promise.reject(data);
      return data;
    });
  }
  /**
   * query
   * @param {Object} sqlOptions
   * @param {Object} connection
   */
  query(sqlOptions, connection) {
    if (helper.isString(sqlOptions)) {
      sqlOptions = { sql: sqlOptions };
    }
    if (sqlOptions.debounce === undefined) {
      if (this.config.debounce !== undefined) {
        sqlOptions.debounce = this.config.debounce;
      } else {
        sqlOptions.debounce = true;
      }
    }
    const startTime = Date.now();
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

      if (sqlOptions.debounce) {
        const key = JSON.stringify(sqlOptions);
        return debounceInstance.debounce(key, () => {
          return this[QUERY](sqlOptions, connection, startTime);
        }).then(data => {
          // release connection if debounce patch
          this.releaseConnection(connection);
          return data;
        });
      } else {
        return this[QUERY](sqlOptions, connection, startTime);
      }
    });
  }
  /**
   * execute
   * @param  {Array} args []
   * @returns {Promise}
   */
  execute(sqlOptions, connection) {
    if (helper.isString(sqlOptions)) {
      sqlOptions = { sql: sqlOptions };
    }
    sqlOptions.debounce = false;
    return this.query(sqlOptions, connection);
  }
  /**
   * close connection
   * @param {Object} connection
   */
  close(connection) {
    if (connection) return connection.end();
    return Promise.resolve(this.pool.end()).then(() => {
      this[POOL] = null;
    });
  }
}

module.exports = thinkInstance(PostgreSQLSocket);
