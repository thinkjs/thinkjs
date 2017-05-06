const thinkRedis = require('think-redis');
const assert = require('assert');
const helper = require('think-helper');
const debug = require('debug')('think-session-redis');

const initSessionData = Symbol('think-session-redis-init');
const autoSave = Symbol('think-session-save');

/**
 * use redis to store session
 */
class RedisSession {
  /**
   * constructor
   * @param {Object} options cookie options
   * @param {Object} ctx koa ctx
   */
  constructor(options = {}, ctx){
    assert(options.cookie, '.cookie required');
    this.options = options;
    this.redis = new thinkRedis(this.options);
    this.ctx = ctx;
    this.data = {};
    this.status = 0;
  }
 
  /**
   * init session data
   */
  [initSessionData](){
    if(this.initPromise){
      return this.initPromise;
    }
    if(this.options.fresh || this.status === -1){
      return this.initPromise = Promise.resolve();
    }
    this.initPromise = this.redis.get(this.options.cookie).then(content => {
      console.log('content', content, this.options.cookie);
      content = JSON.parse(content);console.log(helper.isEmpty({}))
      if(helper.isEmpty(content)) return;
      this.data = content || {};
    }).catch(err => {
      debug(err);
    });
    this[autoSave]();
    return this.initPromise;
  }
  /**
   * auto save session data when it is changed
   */
  [autoSave](){
    this.ctx.res.once('finish', () => {
      if(this.status === -1){
        return this.redis.delete(this.options.cookie);
      }else if(this.status === 1){
        return this.redis.set(this.options.cookie, JSON.stringify(this.data), this.options.maxAge);
      }
    });
  }
 /**
   * get session data
   * @param {String} name 
   */
  get(name){
    return this[initSessionData]().then(() => {
      if(this.options.autoUpdate){
        this.status = 1;
      }
      return name ? this.data[name] : this.data;
    });
  }
  /**
   * set session data
   * @param {String} name 
   * @param {Mixed} value 
   */
  set(name, value){
    return this[initSessionData]().then(() => {
      this.status = 1;
      this.data[name] = value;
    });
  }
  /**
   * delete session data
   */
  delete(){
    this.status = -1;
    this.data = {};
    return Promise.resolve();
  }
}

module.exports = RedisSession;