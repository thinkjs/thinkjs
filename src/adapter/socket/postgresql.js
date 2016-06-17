'use strict';

import Base from './base.js';

/**
 * postgres socket class
 * @return {} []
 */
export default class extends Base {
  /**
   * init
   * @param  {Object} config []
   * @return {}        []
   */
  init(config){
    super.init(config);

    config.port = config.port || 5432;
    //config.password = config.pwd;
    //delete config.pwd;

    this.config = config;
  }
  /**
   * get pg
   * @return {} []
   */
  async getPG(){
    if(this.pg){
      return this.pg;
    }
    let pg = await think.npm('pg');
    //set poolSize
    if(this.config.poolSize){
      pg.defaults.poolSize = this.config.poolSize;
    }
    //set poolIdleTimeout, change default `30 seconds` to 8 hours
    pg.defaults.poolIdleTimeout = this.config.poolIdleTimeout * 1000 || 8 * 60 * 60 * 1000;

    //when has error, close connection
    pg.on('error', () => {
      this.close();
    });
    pg.on('end', () => {
      this.close();
    });
    pg.on('close', () => {
      this.close();
    });
    this.pg = pg;
    return pg;
  }
  /**
   * get connection
   * @return {} []
   */
  async getConnection(){
    if(this.connection){
      return this.connection;
    }
    let pg = await this.getPG();
    let config = this.config;
    let connectionStr = `postgres://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`;

    return think.await(connectionStr, () => {
      let deferred = think.defer();
      pg.connect(this.config, (err, client, done) => {
        this.logConnect(connectionStr, 'postgre');
        if(err){
          deferred.reject(err);
        }else{
          this.connection = client;
          this.release = done;
          deferred.resolve(client);
        }
      });
      return deferred.promise;
    });
  }
  /**
   * query
   * @return {Promise} []
   */
  async query(sql){
    let connection = await this.getConnection();
    let startTime = Date.now();
    let fn = think.promisify(connection.query, connection);
    let promise = fn(sql).then(data => {
      this.release();
      if (this.config.log_sql) {
        think.log(sql, 'SQL', startTime);
      }
      return data;
    }).catch(err => {
      this.release();

      //when socket is closed, try it
      if(err.code === 'EPIPE'){
        this.close();
        return this.query(sql);
      }

      if (this.config.log_sql) {
        think.log(sql, 'SQL', startTime);
      }
      return Promise.reject(err);
    });
    return think.error(promise);
  }
  /**
   * execute sql
   * @param  {Array} args []
   * @return {Promise}         []
   */
  execute(...args){
    return this.query(...args);
  }
  /**
   * close connection
   * @return {} []
   */
  close(){
    if(this.connection){
      this.connection.end();
      this.connection = null;
    }
  }
}