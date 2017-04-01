/*
* @Author: lushijie
* @Date:   2017-03-22 14:19:15
* @Last Modified by:   lushijie
* @Last Modified time: 2017-04-01 16:27:19
*/
const helper = require('think-helper');
const assert = require('assert');
const Memcached = require('memcache-plus');
let _getConnection = Symbol('getConnection');
let _validExpire = Symbol('validExpire');
let cacheConn = {};

const defaultOptions = {
  hosts: ['127.0.0.1:11211'],
  maxValueSize: 1048576,
  netTimeout: 5000,
  reconnect: true
}

class thinkMemcache {
  /**
   * constructor, all config options see at https://github.com/victorquinn/memcache-plus
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
    assert(/^[-+]?[0-9]+$/.test(expire), 'expire should be integer');
  }

  /**
   * getConnection by config
   * @param  {Object} config [description]
   * @return {Object}        [description]
   */
  [_getConnection](config) {
    let md5 = helper.md5(JSON.stringify(config));
    if(!cacheConn[md5] || Object.keys(cacheConn[md5].connections) === 0) {
      cacheConn[md5] = new Memcached(config);
    }
    return cacheConn[md5];
  }

  /**
   * set key
   * @param {Stirng} key    [description]
   * @param {String} value  [description]
   * @param {Int} expire    [millisecond]
   * @return {Promise}      [description]
   */
  set(key, value, expire) {
    expire = expire || 0;
    this[_validExpire](expire);
    if(expire > 0){
      expire = Math.round(Date.now() / 1000 + expire / 1000); // deal with expire greater than 30 days
    }
    return this.memcache.set(key, value, expire);
  }

  /**
   * get key
   * @param  {String} key [description]
   * @return {Promise}     [description]
   */
  get(key) {
    return this.memcache.get(key);
  }

  /**
   * delete key
   * @param  {String} key [description]
   * @return {Promise}     [description]
   */
  delete(key) {
    return this.memcache.delete(key);
  }

  /**
   * increase key's value
   * @param  {String} key [description]
   * @return {Promise}     [description]
   */
  increase(key) {
    return this.memcache.incr(key);
  }

  /**
   * decrease key's value
   * @param  {String} key [description]
   * @return {Promise}     [description]
   */
  decrease(key) {
    return this.memcache.decr(key);
  }

  /**
   * close connection
   * @return {void} [description]
   */
  close() {
    this.memcache.disconnect();
  }
}

module.exports = thinkMemcache;
