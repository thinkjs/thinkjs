'use strict';
/**
 * memcache socket
 */
export default class extends think.adapter.socket {
  /**
   * inti
   * @param  {Object} config []
   * @return {}        []
   */
  init(config = {}){
    this.config = think.extend({
      host: '127.0.0.1',
      port: 11211,
      username: '',
      password: ''
    }, config);
    this.connection = null;
  }
  /**
   * get connection
   * @return {Promise} []
   */
  async getConnection(){
    if(this.connection){
      return this.connection;
    }
    let memjs = await think.npm('memjs');
    let config = this.config;
    let str = `${config.username}:${config.password}@${config.host}:${config.port}`;
    this.connection = memjs.Client.create(str);
    return this.connection;
  }
  /**
   * get data
   * @param  {String} key []
   * @return {Promise}     []
   */
  async get(key){
    let connection = await this.getConnection();
    let deferred = think.defer();
    connection.get(key, (err, data) => err ? deferred.reject(err) : deferred.resolve(data && data.toString()));
    return deferred.promise;
  }
  /**
   * set data 
   * @param {String} key     []
   * @param {String} value   []
   * @param {Number} timeout []
   */
  async set(key, value, timeout = this.config.timeout){
    let connection = await this.getConnection();
    let deferred = think.defer();
    connection.set(key, value, err => err ? deferred.reject(err) : deferred.resolve(), timeout);
    return deferred.promise;
  }
  /**
   * delete data
   * @param  {String} key []
   * @return {Promise}     []
   */
  async delete(key){
    let connection = await this.getConnection();
    let deferred = think.defer();
    connection.delete(key, (err, data) => err ? deferred.reject(err) : deferred.resolve(data));
    return deferred.promise;
  }
  /**
   * increment
   * @param  {String} key     []
   * @param  {Number} amount  []
   * @param  {Number} timeout []
   * @return {Promise}         []
   */
  async increment(key, amount, timeout = this.config.timeout){
    let connection = await this.getConnection();
    let deferred = think.defer();
    connection.increment(key, amount, err => err ? deferred.reject(err) : deferred.resolve(), timeout);
    return deferred.promise;
  }
  /**
   * decrement
   * @param  {String} key     []
   * @param  {Number} amount  []
   * @param  {Number} timeout []
   * @return {Promise}         []
   */
  async decrement(key, amount, timeout = this.config.timeout){
    let connection = await this.getConnection();
    let deferred = think.defer();
    connection.decrement(key, amount, err => err ? deferred.reject(err) : deferred.resolve(), timeout);
    return deferred.promise;
  }
  /**
   * close socket connection
   * @return {} []
   */
  close(){
    if(this.connection){
      this.connection.close();
      this.connection = null;
    }
  }
}