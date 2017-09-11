/*
* @Author: lushijie
* @Date:   2017-03-16 09:23:41
* @Last Modified by:   lushijie
* @Last Modified time: 2017-09-11 12:21:59
*/
const helper = require('think-helper');
const Memcache = require('think-memcache');

// memcache config see at http://memcache-plus.com/
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
    // return this.memcache.get(key);
    return this.memcache.get(key).then((data) => {
      try {
        return JSON.parse(data);
      } catch (e) {
        return data;
      }
    });
  }

  /**
   * get cache key's content
   * @param {String} key     [description]
   * @param {String} content [description]
   * @param {Number} timeout [millisecond]
   * @return {Promise}      [description]
   */
  set(key, content, timeout = this.timeout) {
    content = JSON.stringify(content);
    return this.memcache.set(key, content, timeout);
  }

  /**
   * delete cache key
   * @param  {String} key [description]
   * @return {Promise}     [description]
   */
  delete(key) {
    return this.memcache.delete(key);
  }
}

module.exports = MemcacheCache;
