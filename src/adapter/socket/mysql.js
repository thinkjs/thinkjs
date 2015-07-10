'use strict';

import mysql from 'mysql';

/**
 * mysql socket class
 * @return {} []
 */
export default class extends think.adapter.socket {
  /**
   * init
   * @param  {Object} config [connection options]
   * @return {}        []
   */
  init(config){
    //alias password config
    config.password = config.pwd;
    config.database = config.name;
    //merge config
    this.config = think.extend({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: ''
    }, config);

    this.pool = null;
    this.connection = null;
    this.deferred = null;
  }
  /**
   * get connection
   * @return {Promise} [conneciton handle]
   */
  getConnection(){
    let deferred = think.defer();
    if(this.pool){
      this.pool.getConnection((err, connection) => {
        if(err){
          deferred.reject(err);
          this.close();
        }else{
          deferred.resolve(connection);
        }
      });
      return deferred.promise;
    }
    if(this.config.connectionLimit){
      this.pool = mysql.createPool(this.config);
      return this.getConnection();
    }

    if(this.connection){
      return this.deferred.promise;
    }
    this.connection = mysql.createConnection(this.config);
    this.connection.connect(err => {
      if (err) {
        deferred.reject(err);
        this.close();
      }else{
        deferred.resolve(this.connection);
      }
    });
    this.connection.on('error', () => {
      this.close();
    });
    //PROTOCOL_CONNECTION_LOST
    this.connection.on('end', () => {
      this.close();
    });
    this.deferred = deferred;
    return deferred.promise;
  }
  /**
   * query sql
   * @param  {String} sql []
   * @return {[type]}     []
   */
  async query(sql, nestTables){
    if (think.config('db.log_sql')) {
      think.log(sql, 'SQL');
    }
    let connection = await this.getConnection();
    let deferred = think.defer();
    let data = {
      sql: sql,
      nestTables: nestTables
    };
    //query timeout
    if(this.config.timeout){
      data.timeout = this.config.timeout;
    }
    connection.query(data, (err, rows = []) => {
      if (err) {
        deferred.reject(err);
      }else{
        deferred.resolve(rows);
      }
      //auto close connection in cli mode
      if(think.cli){
        this.close();
      }
    });
    return deferred.promise;
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
    if(this.pool){
      this.pool.end(() => this.pool = null);
    }else if (this.connection) {
      this.connection.end(() => this.connection = null);
    }
  }
}