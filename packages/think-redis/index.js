/*
* @Author: lushijie
* @Date:   2017-03-22 14:19:15
* @Last Modified by:   lushijie
* @Last Modified time: 2017-03-23 10:01:19
*/
const helper = require('think-helper');
const assert = require('assert');
const ioredis = require('ioredis');
let _validExpire = Symbol('validExpire');

class thinkRedis {

  // config see at https://github.com/luin/ioredis/blob/master/lib/redis.js
  constructor(config) {
    this.redis = new ioredis(config);
  }

  /**
   * valid expire num
   */
  [_validExpire](num) {
    let needMessage = 'expire should be an int great than zero';
    assert(num && /^[+]?[0-9]+$/.test(num) && num > 0, needMessage);
  }

  /**
   * get key
   * @param  {String} key [description]
   * @return {Promise}     [description]
   */
  get(key) {
    return this.redis.get(key);
  }

  /**
   * add event listener
   * @param  {String}   event    [description]
   * @param  {Function} callback [description]
   * @return {void}            [description]
   */
  on(event, callback) {
    this.redis.on(event, callback);
  }

  /**
   * set key
   * @param {Stirng} key    [description]
   * @param {String} value  [description]
   * @param {EX|PX} type   [description]
   * @param {int>0} expire [description]
   * @return {Promise}     [description]
   */
  set(key, value, type, expire) {
    if(type) {
      if(helper.isString(type)) {
        assert(type === 'EX' || type === 'PX', 'type should eq "EX" or "PX"');
        this[_validExpire](expire);
        return this.redis.set(key, value, type, expire);
      }else {
        this[_validExpire](type);
        return this.redis.set(key, value, 'EX', type);
      }
    }

    // without type
    return this.redis.set(key, value);
  }

  /**
   * delete key
   * @param  {String} key [description]
   * @return {Promise}     [description]
   */
  delete(key) {
    return this.redis.del(key);
  }

  /**
   * close connection
   * @return {void} [description]
   */
  close() {
    if(this.redis.connector.connecting) {
      this.redis.disconnect();
    }
  }
}

module.exports = thinkRedis;


