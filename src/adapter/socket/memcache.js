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
    this.connection = memjs.Client.create(str, {
      logger: {
        log: () => {}
      }
    });
    return this.connection;
  }
  /**
   * wrap method
   * @param  {String}    name []
   * @param  {} args []
   * @return {Promise}         []
   */
  async wrap(name, ...args){
    let connection = await this.getConnection();
    let deferred = think.defer();
    let callback = (err, data) => err ? deferred.reject(err) : deferred.resolve(data && data.toString());
    if(args.length === 1){
      args.push(callback);
    }else{
      args = [args[0], args[1], callback, args[2]];
    }
    connection[name](...args);
    return deferred.promise.catch(err => {
      err = think.error(err, `${this.config.host}:${this.config.port}`);
      return think.reject(new Error(err.message));
    });
  }
  /**
   * get data
   * @param  {String} key []
   * @return {Promise}     []
   */
  get(key){
    return this.wrap('get', key);
  }
  /**
   * set data 
   * @param {String} key     []
   * @param {String} value   []
   * @param {Number} timeout []
   */
  set(key, value, timeout = this.config.timeout){
    return this.wrap('set', key, value, timeout);
  }
  /**
   * delete data
   * @param  {String} key []
   * @return {Promise}     []
   */
  delete(key){
    return this.wrap('delete', key);  
  }
  /**
   * increment
   * @param  {String} key     []
   * @param  {Number} amount  []
   * @param  {Number} timeout []
   * @return {Promise}         []
   */
  increment(key, amount, timeout = this.config.timeout){
    return this.wrap('increment', key, amount, timeout);
  }
  /**
   * decrement
   * @param  {String} key     []
   * @param  {Number} amount  []
   * @param  {Number} timeout []
   * @return {Promise}         []
   */
  decrement(key, amount, timeout = this.config.timeout){
    return this.wrap('decrement', key, amount, timeout);
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