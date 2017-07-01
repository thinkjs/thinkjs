const mysql = require('mysql');
const helper = require('think-helper');
const assert = require('assert');
const Debounce = require('think-debounce');
const thinkInstance = require('think-instance');

const debug = require('debug')('think-mysql');
const debounceInstance = new Debounce();
const QUERY = Symbol('think-mysql-query');

const defaultConfig = {
  port: 3306,
  host: '127.0.0.1',
  user: '',
  password: '',
  database: '',
  connectionLimit: 1,
  multipleStatements: true,
  logger: console.log.bind(console),
  logConnect: false,
  logSql: false
};

/**
 * transaction status
 */
const TRANSACTION = {
  start: 1,
  end: 2
}

class ThinkMysql {
  /**
   * @param  {Object} config [connection options]
   */
  constructor(config) {
    config = helper.extend({}, defaultConfig, config);
    this.config = config;
    this.pool = mysql.createPool(config);

    //log connect
    if(config.logConnect){
      let connectionPath = '';
      if(config.socketPath){
        connectionPath = config.socketPath;
      }else{
        connectionPath = `mysql://${config.user}:${config.password}@${config.host}:${config.port || 3306}/${config.database}`;
      }
      config.logger(connectionPath);
    }
  }
  /**
   * get connection
   */
  getConnection(connection){
    if(connection) return Promise.resolve(connection);
    return helper.promisify(this.pool.getConnection, this.pool)();
  }
  /**
   * start transaction
   * @param {Object} connection 
   */
  startTrans(connection){
    return this.getConnection(connection).then(connection => {
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
  commit(connection){
    return this.query({
      sql: 'COMMIT',
      transaction: TRANSACTION.end,
      debounce: false,
    }, connection);
  }
  /**
   * rollback transaction
   * @param {Object} connection 
   */
  rollback(connection){
    return this.query({
      sql: 'ROLLBACK',
      transaction: TRANSACTION.end,
      debounce: false,
    }, connection);
  }
  /**
   * transaction
   * @param {Function} fn 
   * @param {Object} connection 
   */
  transaction(fn, connection){
    assert(helper.isFunction(fn), 'fn must be a function');
    return this.getConnection(connection).then(connection => {
      return this.startTrans(connection).then(() => {
         return fn(connection);
      }).then(data => {
        return this.commit(connection).then(() => data);
      }).catch(err => {
        return this.rollback(connection).then(() => Promise.reject(err));
      })
    });
  }
  /**
   * query data
   */
  [QUERY](sqlOptions, connection, startTime){
    let err = null;
    let queryFn = helper.promisify(connection.query, connection);
    return queryFn(sqlOptions).catch(e => {
      err = e;
    }).then(data => {
      //log sql
      if(this.config.logSql){
        let endTime = Date.now();
        this.config.logger(`SQL: ${sqlOptions.sql}, Time: ${endTime - startTime}ms`);
      }
      this.releaseConnection(connection);
      
      if(err) return Promise.reject(err);
      return data;
    });
  }
  /**
   * release connection
   */
  releaseConnection(connection){
    //if not in transaction, release connection
    if(connection.transaction !== TRANSACTION.start){
      debug('release connection, id=' + connection.threadId);
      //connection maybe already released, so and try for it
      try{
        connection.release();
      }catch(e){}
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
    if(helper.isString(sqlOptions)){
      sqlOptions = {sql: sqlOptions};
    }
    if(sqlOptions.debounce === undefined){
      sqlOptions.debounce = true;
    }
    let startTime = Date.now();
    return this.getConnection(connection).then(connection => {
      debug('get connection, id=' + connection.threadId);
      //set transaction status to connection
      if(sqlOptions.transaction){
        if(sqlOptions.transaction === TRANSACTION.start){
          if(connection.transaction === TRANSACTION.start) return;
        }else if(sqlOptions.transaction === TRANSACTION.end){
          if(connection.transaction !== TRANSACTION.start) {
            this.releaseConnection(connection);
            return;
          }
        }
        connection.transaction = sqlOptions.transaction;
      }

      if(sqlOptions.debounce){
        let key = JSON.stringify(sqlOptions);
        return debounceInstance.debounce(key, () => {
          return this[QUERY](sqlOptions, connection, startTime);
        });
      }else{
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
    if(helper.isString(sqlOptions)){
      sqlOptions = {sql: sqlOptions};
    }
    sqlOptions.debounce = false;
    return this.query(sqlOptions, connection);
  }
  /**
   * close
   * @returns {Promise}
   */
  close(){
    return helper.promisify(this.pool.end, this.pool)();
  }
}
module.exports = thinkInstance(ThinkMysql);
