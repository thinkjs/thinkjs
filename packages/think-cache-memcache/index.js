/*
* @Author: lushijie
* @Date:   2017-03-16 09:23:41
* @Last Modified by:   lushijie
* @Last Modified time: 2017-04-01 17:46:07
*/
const helper = require('think-helper');
const Memcache = require('think-memcache');

const defaultConfig = {
  timeout: 24 * 3600 * 1000,
  hosts: ['127.0.0.1:11211'],
  maxValueSize: 1048576,
  netTimeout: 5000,
  reconnect: true
};

/**
 * memcache cache adapter
 */
class MemcacheCache {

  constructor(config = {}) {
    config = helper.extend({}, defaultConfig, config);
    this.memcache = new Memcache(config);
    this.timeout = config.timeout;
  }

  /**
   * get cache content by the cache key
   * @param  {String} key [description]
   * @return {Promise}      [description]
   */
  get(key) {
    return  this.memcache.get(key).catch(() => {});
  }

  /**
   * get cache key's content
   * @param {String} key     [description]
   * @param {String} content [description]
   * @param {Number} timeout [millisecond]
   * @return {Promise}      [description]
   */
  set(key, content, timeout = this.timeout) {
    return  this.memcache.set(key, content, timeout).catch(() => {});
  }

  /**
   * delete cache key
   * @param  {String} key [description]
   * @return {Promise}     [description]
   */
  delete(key) {
    return this.memcache.delete(key).catch(() => {});
  }

}

module.exports = MemcacheCache;
