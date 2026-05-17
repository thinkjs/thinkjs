const thinkInstance = require('think-instance');
const sqlite = require('sqlite3');
const assert = require('assert');
const helper = require('think-helper');
const path = require('path');
const genericPool = require('generic-pool');
const Debounce = require('think-debounce');

const CREATE_POOL = Symbol('think-sqlite-create-pool');
const QUERY = Symbol('think-sqlite-query');
const POOL = Symbol('think-sqlite-pool');

const defaultOptions = {
  logger: console.log.bind(console), /* eslint no-console: ["error", { allow: ["log"] }] */
  logConnect: true
};

/**
 * transaction status
 */
const TRANSACTION = {
  start: 1,
  end: 2
};

class SQLiteSocket {
  constructor(config = {}) {
    // different socket may connect to different db,so use independent debounce instance
    this.debounceInstance = new Debounce();
    this.config = Object.assign({}, defaultOptions, config);
    let savePath = this.config.path;
    if (savePath === true || savePath === ':memory:') {
      savePath = ':memory:';
    } else {
      assert(savePath, 'config.path must be set');
      helper.mkdir(savePath);
      savePath = path.join(savePath, `${this.config.database}.sqlite`);
    }
    this.savePath = savePath;
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
        const deferred = helper.defer();
        const db = new sqlite.Database(this.savePath, err => {
          if (this.config.logConnect) {
            this.config.logger(`sqlite:${this.savePath}`);
          }
          if (err) return deferred.reject(err);
          deferred.resolve(db);
        });
        let timeout = this.config.timeout;
        if (timeout) {
          timeout = helper.ms(timeout);
          db.configure('busyTimeout', timeout);
        }
        return deferred.promise;
      },
      destroy: (client) => {
        client.close();
        return Promise.resolve();
      }
    };
    const options = {
      min: 1,
      max: this.config.connectionLimit || 1,
      acquireTimeoutMillis: this.config.acquireTimeout
    };
    return genericPool.createPool(factory, options);
  }
  /**
   * get connection
   */
  getConnection(connection) {
    if (connection) return Promise.resolve(connection);
    return this.pool.acquire();
  }
  /**
   * start transaction
   * @param {Object} connection
   */
  startTrans(connection) {
    return this.getConnection(connection).then(connection => {
      return this.query({
        sql: 'BEGIN TRANSACTION',
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
        this.pool.release(connection);
      } catch (e) {}
    }
  }
  /**
   * query data
   */
  [QUERY](sqlOptions, connection, startTime) {
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

      let promise = null;
      if (sqlOptions.execute) {
        promise = new Promise((resolve, reject) => {
          connection.run(sqlOptions.sql, function(err) {
            if (err) return reject(err);
            resolve({insertId: this.lastID, affectedRows: this.changes});
          });
        });
      } else {
        const queryFn = helper.promisify(connection.all, connection);
        promise = queryFn(sqlOptions.sql);
      }
      return promise.catch(err => {
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
    });
  }

  /**
   * query
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
      return this.debounceInstance.debounce(key, () => {
        return this[QUERY](sqlOptions, connection, startTime);
      });
    } else {
      return this[QUERY](sqlOptions, connection, startTime);
    }
  }

  /**
   * execute
   * @returns {Promise}
   * @param sqlOptions
   * @param connection
   */
  execute(sqlOptions, connection) {
    if (helper.isString(sqlOptions)) {
      sqlOptions = {sql: sqlOptions};
    }
    sqlOptions.debounce = false;
    sqlOptions.execute = true;
    return this.query(sqlOptions, connection);
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
}

module.exports = thinkInstance(SQLiteSocket);
