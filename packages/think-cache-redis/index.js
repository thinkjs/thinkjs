/*
* @Author: lushijie
* @Date:   2017-03-16 09:23:41
* @Last Modified by:   lushijie
* @Last Modified time: 2017-09-13 12:05:15
*/
const helper = require('think-helper');
const Redis = require('think-redis');

const defaultOptions = {
  port: 6379,
  host: '127.0.0.1',
  password: '',
  timeout: 24 * 3600 * 1000
};

/**
 * redis cache adapter
 */
class RedisCache {
  constructor(config = {}) {
    config = helper.extend({}, defaultOptions, config);
    this.redis = new Redis(config);
    this.timeout = config.timeout;
  }

  /**
   * get cache content by the cache key
   * @param  {String} key [description]
   * @return {Promise}      [description]
   */
  get(key) {
    return this.redis.get(key).then((data) => {
      if (data === null) return undefined; // think-cache-file return undefined
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
    return this.redis.set(key, content, timeout);
  }

  /**
   * delete cache key
   * @param  {String} key [description]
   * @return {Promise}     [description]
   */
  delete(key) {
    return this.redis.delete(key);
  }

  /**
   * delete Regular expressions key
   * @param regKey
   * @return {Promise}     [description]
   */
  deleteRegKeys(regKey) {
    return this.redis.deleteRegKey(regKey);
  }
}

module.exports = RedisCache;
