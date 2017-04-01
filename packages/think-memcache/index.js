/*
* @Author: lushijie
* @Date:   2017-03-22 14:19:15
* @Last Modified by:   lushijie
* @Last Modified time: 2017-04-01 15:15:59
*/
const helper = require('think-helper');
const assert = require('assert');
const Memcached = require('memcached');
let _getConnection = Symbol('getConnection');
let _validExpire = Symbol('validExpire');
let cacheConn = {};

const defaultOptions = {
  server: '127.0.0.1:11211',
  options: {
    maxExpiration: 2592000,
    maxKeySize: 250,
    maxValue: 1048576,
    algorithm: 'md5',
    timeout: 5000
  }
}

class thinkMemcache {
  /**
   * constructor, all config options see at https://github.com/3rd-Eden/memcached
   * @param  {Object} config [description]
   * @return {}        [description]
   */
  constructor(config) {
    this.config = helper.extend({}, defaultOptions, config);
    this.memcache = this[_getConnection](this.config);
  }


  /**
   * valid expire num
   */
  [_validExpire](expire) {
    let maxExpirationMs = this.config.options.maxExpiration * 1000;
    assert(/^[-+]?[0-9]+$/.test(expire) && expire < maxExpirationMs, 'expire should be less than config.options.maxExpiration');
  }

  /**
   * getConnection by config
   * @param  {Object} config [description]
   * @return {Object}        [description]
   */
  [_getConnection](config) {
    let md5 = helper.md5(JSON.stringify(config));
    if(!cacheConn[md5] ) {
      cacheConn[md5] = new Memcached(config.server, config.options);
    }
    return cacheConn[md5];
  }

  /**
   * add event listener
   * @param  {String}   event  [issue,failure,reconnecting,reconnect,remove is supported]
   * @param  {Function} callback [description]
   * @return {void}            [description]
   */
  on(event, callback) {
    this.memcache.on(event, callback);
  }

  /**
   * set key
   * @param {Stirng} key    [description]
   * @param {String} value  [description]
   * @param {Int} expire    [millisecond]
   * @return {Promise}      [description]
   */
  set(key, value, expire) {
    expire = expire || this.config.options.maxExpiration;
    this[_validExpire](expire);
    if(expire > 0){
      expire = Math.round(Date.now() / 1000 + expire / 1000); // deal with expire greater than 30 days
    }
    return new Promise((resolve, reject) => {
      this.memcache.set(key, value, expire, (err) => {
        if(err) {
          reject(err);
        }
        resolve(true);
      });
    });
  }

  /**
   * get key
   * @param  {String} key [description]
   * @return {Promise}     [description]
   */
  get(key) {
    return new Promise((resolve, reject) => {
      this.memcache.get(key, (err, data) => {
        if(err) {
          reject(err);
        }
        resolve(data);
      });
    });
  }

  /**
   * delete key
   * @param  {String} key [description]
   * @return {Promise}     [description]
   */
  delete(key) {
    return new Promise((resolve, reject) => {
      this.memcache.del(key, (err) => {
        if(err) {
          reject(err);
        }
        resolve(true);
      });
    });

  }

  /**
   * increase key's value
   * @param  {String} key [description]
   * @return {Promise}     [description]
   */
  increase(key) {
    return new Promise((resolve, reject) => {
      this.memcache.incr(key, 1, (err) => {
        if(err) {
          reject(err);
        }
        resolve(true);
      });
    });
  }

  /**
   * decrease key's value
   * @param  {String} key [description]
   * @return {Promise}     [description]
   */
  decrease(key) {
    return new Promise((resolve, reject) => {
      this.memcache.decr(key, 1, (err) => {
        if(err) {
          reject(err);
        }
        resolve(true);
      });
    });
  }

  /**
   * close connection
   * @return {void} [description]
   */
  close() {
    this.memcache.end();
  }
}

module.exports = thinkMemcache;
