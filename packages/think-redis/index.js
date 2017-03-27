/*
* @Author: lushijie
* @Date:   2017-03-22 14:19:15
* @Last Modified by:   lushijie
* @Last Modified time: 2017-03-27 16:08:43
*/
const helper = require('think-helper');
const assert = require('assert');
const ioredis = require('ioredis');
let _validExpire = Symbol('validExpire');

// redis config see at https://github.com/luin/ioredis/blob/master/lib/redis.js
const defaultConfig = {
  port: 6379,
  host: '127.0.0.1',
  password: '',
};

class thinkRedis {

  constructor(config) {
    this.redis = new ioredis(helper.extend({}, defaultConfig, config));
  }

  /**
   * valid expire num
   */
  [_validExpire](num) {
    let msg = 'expire should be an integer great than zero';
    assert(num && /^[+]?[0-9]+$/.test(num) && num > 0, msg);
  }

  /**
   * add event listener
   * @param  {String}   event  [connect,ready,error,close,reconnecting,end is supported]
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
   * @param {String} type   [EX='seconds'|PX='milliseconds']
   * @param {Int} expire    [>0]
   * @return {Promise}      [description]
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
   * get key
   * @param  {String} key [description]
   * @return {Promise}     [description]
   */
  get(key) {
    return this.redis.get(key);
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
   * increment key's value
   * @param  {String} key [description]
   * @return {Promise}     [description]
   */
  increment(key) {
    return this.redis.incr(key);
  }

  /**
   * decrement key's value
   * @param  {String} key [description]
   * @return {Promise}     [description]
   */
  decrement(key) {
    return this.redis.decr(key);
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


