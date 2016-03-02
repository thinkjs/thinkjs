'use strict';

import Base from './base.js';

/**
 * mysql socket class
 * @return {} []
 */
export default class extends Base {
  /**
   * init
   * @param  {Object} config [connection options]
   * @return {}        []
   */
  init(config = {}){
    super.init(config);
    
    //alias password config
    // if (config.pwd) {
    //   config.password = config.pwd;
    //   delete config.pwd;
    // }
    //merge config
    this.config = think.extend({
      host: '127.0.0.1',
      user: 'root',
      password: ''
    }, config);
    this.config.port = this.config.port || 3306;

    this.pool = null;
  }
  /**
   * get connection
   * @return {Promise} [conneciton handle]
   */
  async getConnection(){
    if (this.connection) {
      return this.connection;
    }

    let config = this.config;
    let str = `mysql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`;

    if (this.pool) {
      let fn = think.promisify(this.pool.getConnection, this.pool);
      let promise = fn().catch(err => {
        this.close();
        return Promise.reject(err);
      });
      let err = new Error(str);
      return think.error(promise, err);
    }

    let mysql = await think.npm('mysql');

    if (config.connectionLimit) {
      this.logConnect(str, 'mysql');
      
      this.pool = mysql.createPool(config);
      return this.getConnection();
    }

    return think.await(str, () => {
      let deferred = think.defer();
      this.connection = mysql.createConnection(config);
      this.connection.connect(err => {
        
        this.logConnect(str, 'mysql');

        if (err) {
          deferred.reject(err);
          this.close();
        } else {
          deferred.resolve(this.connection);
        }
      });
      this.connection.on('error', () => {
        this.close();
      });
      //PROTOCOL_CONNECTION_LOST
      this.connection.on('end', () => {
        this.connection = null;
      });
      let err = new Error(str);
      return think.error(deferred.promise, err);
    });
  }
  /**
   * query sql
   * @param  {String} sql []
   * @return {[type]}     []
   */
  async query(sql, nestTables){
    let connection = await this.getConnection();
    let data = {
      sql: sql,
      nestTables: nestTables
    };
    //query timeout
    if (this.config.timeout) {
      data.timeout = this.config.timeout;
    }
    let startTime = Date.now();
    let fn = think.promisify(connection.query, connection);
    let promise = fn(data).then((rows = []) => {
      // just call connection.release() and the connection will return to the pool, 
      // ready to be used again by someone else.
      // https://github.com/felixge/node-mysql#pooling-connections
      if(this.pool && connection.release){
        connection.release();
      }

      if (this.config.log_sql) {
        think.log(sql, 'SQL', startTime);
      }
      return rows;
    }).catch(err => {
      if(this.pool && connection.release){
        connection.release();
      }
      //Connection lost: The server closed the connection.
      if(err.code === 'PROTOCOL_CONNECTION_LOST'){
        this.close();
      }
      
      if (this.config.log_sql) {
        think.log(sql, 'SQL', startTime);
      }
      return Promise.reject(err);
    });
    promise = this.autoClose(promise);
    return think.error(promise);
  }
  /**
   * execute
   * @param  {Array} args []
   * @return {Promise}         []
   */
  execute(...args){
    return this.query(...args);
  }
  /**
   * close connections
   * @return {} []
   */
  close(){
    if (this.pool) {
      this.pool.end(() => this.pool = null);
    } else if (this.connection) {
      this.connection.end(() => this.connection = null);
    }
  }
}