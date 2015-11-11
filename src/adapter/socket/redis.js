'use strict';

import Base from './base.js';

/**
 * Redis socket class
 */
export default class extends Base {
  /**
   * init
   * @param  {Object} config []
   * @return {}        []
   */
  init(config = {}){
    super.init(config);

    this.config = think.extend({
      port: 6379,
      host: '127.0.0.1',
      password: ''
    }, config);
  }
  /**
   * connect redis
   * @return {Promise} []
   */
  async getConnection(){
    if (this.connection) {
      return this.connection;
    }
    let redis = await think.npm('redis');
    let config = this.config;
    let str = `redis://${config.host}:${config.port}`;
    return think.await(str, () => {

      let deferred = think.defer();
      let connection = redis.createClient(config.port, config.host, config);
      if (config.password) {
        connection.auth(config.password, () => {});
      }
      connection.on('connect', () => {
        this.connection = connection;
        this.logConnect(str, 'redis');
        deferred.resolve(connection);
      });
      connection.on('error', err => {
        this.close();
        this.logConnect(str, 'redis');
        deferred.reject(err);
      });
      let err = new Error(str);
      return think.error(deferred.promise, err);
    });
  }
  /**
   * add event
   * @param  {String}   event    []
   * @param  {Function} callback []
   * @return {}            []
   */
  on(event, callback){
    return this.getConnection().then(connection => {
      connection.on(event, callback);
    });
  }
  /**
   * wrap
   * @param  {String}    name []
   * @param  {Array} data []
   * @return {Promise}         []
   */
  async wrap(name, ...data){
    await this.getConnection();
    let fn = think.promisify(this.connection[name], this.connection);
    return think.error(fn(...data));
  }
  /**
   * get data
   * @param  {String} name []
   * @return {Promise}      []
   */
  get(name){
    return this.wrap('get', name);
  }
  /**
   * set data
   * @param {String} name    []
   * @param {String} value   []
   * @param {Number} timeout []
   */
  set(name, value, timeout = this.config.timeout){
    let setP = [this.wrap('set', name, value)];
    if (timeout) {
      setP.push(this.expire(name, timeout));
    }
    return Promise.all(setP);
  }
  /**
   * set data expire
   * @param  {String} name    []
   * @param  {Number} timeout []
   * @return {Promise}         []
   */
  expire(name, timeout){
    return this.wrap('expire', name, timeout);
  }
  /**
   * delete data
   * @param  {String} name []
   * @return {Promise}      []
   */
  delete(name){
    return this.wrap('del', name);
  }
  /**
   * close socket connection
   * @return {} []
   */
  close(){
    if(this.connection){
      this.connection.end();
      this.connection = null;
    }
  }
}