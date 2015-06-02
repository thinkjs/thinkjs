'use strict';

let redisSocket = think.adapter('socket', 'redis');

/**
 * redis session
 */
export default class extends think.adapter.session {
  /**
   * init
   * @param  {Object} options []
   * @return {}         []
   */
  init(options = {}){
    this.timeout = options.timeout;
    this.key = options.cookie;
    this.redis = new redisSocket(options);
  }
  /**
   * get session
   * @return {Promise} []
   */
  getData(){
    if(this.data){
      return Promise.resolve();
    }
    return this.redis.get(this.key).then(data => {
      this.data = JSON.parse(data) || {};
    });
  }
  /**
   * get data
   * @param  {String} name []
   * @return {Promise}      []
   */
  get(name){
    return this.getData().then(() => {
      return name ? this.data : this.data[name];
    });
  }
  /**
   * set data
   * @param {String} name    []
   * @param {Mixed} value   []
   * @param {Number} timeout []
   */
  set(name, value, timeout){
    if(timeout){
      this.timeout = timeout;
    }
    return this.getData().then(() => {
      this.data[name] = value;
    });
  }
  /**
   * rm data
   * @param  {String} name []
   * @return {Promise}      []
   */
  rm(name){
    return this.getData().then(() => {
      if(name){
        delete this.data[name];
      }else{
        this.data = {};
      }
    });
  }
  /**
   * flush data
   * @return {Promise} []
   */
  flush(){
    return this.redis.set(this.key, JSON.stringify(this.data), this.timeout);
  }
}