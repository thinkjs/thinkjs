const ThinkRedis = require('think-redis');
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
  constructor(options = {}, ctx, cookieOptions) {
    assert(options.cookie, '.cookie required');
    this.options = options;
    this.cookieOptions = cookieOptions;
    this.redis = new ThinkRedis(this.options);
    this.ctx = ctx;
    this.data = {};
    this.status = 0;
    this.maxAge = this.options.maxAge || 0;
    this.expires = 0;
  }

  /**
   * init session data
   */
  [initSessionData]() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this[autoSave]();
    if (this.options.fresh || this.status === -1) {
      this.initPromise = Promise.resolve();
      return this.initPromise;
    }
    this.initPromise = this.redis.get(this.options.cookie).then(content => {
      content = JSON.parse(content);
      if (helper.isEmpty(content)) return;
      this.data = content.data || {};
      if (content.maxAge) {
        this.maxAge = content.maxAge;
      }
      this.expires = content.expires || 0;
      this.autoUpdate();
    }).catch(err => debug(err));
    return this.initPromise;
  }
  autoUpdate() {
    if (this.maxAge && this.expires) {
      const rate = (this.expires - Date.now()) / this.maxAge;
      if (rate < this.cookieOptions.autoUpdateRate) {
        this.status = 1;
        this.cookieOptions.maxAge = this.maxAge;
        // update cookie maxAge
        this.ctx.cookie(this.cookieOptions.name, this.options.cookie, this.cookieOptions);
      }
    }
  }
  /**
   * auto save session data when it is changed
   */
  [autoSave]() {
    this.ctx.res.once('finish', () => {
      if (this.status === -1) {
        return this.redis.delete(this.options.cookie);
      } else if (this.status === 1) {
        // if not fresh, can not override maxAge (may be set user defined timeout)
        return this.redis.set(this.options.cookie, JSON.stringify({
          data: this.data,
          maxAge: this.maxAge,
          expires: Date.now() + this.maxAge
        }), 'PX', this.maxAge);
      }
    });
  }
  /**
   * get session data
   * @param {String} name
   */
  get(name) {
    return this[initSessionData]().then(() => {
      return name ? this.data[name] : this.data;
    });
  }
  /**
   * set session data
   * @param {String} name
   * @param {Mixed} value
   */
  set(name, value) {
    return this[initSessionData]().then(() => {
      this.status = 1;
      if (value === null) {
        delete this.data[name];
      } else {
        this.data[name] = value;
      }
    });
  }
  /**
   * delete session data
   */
  delete() {
    this.status = -1;
    this.data = {};
    return Promise.resolve();
  }
}

module.exports = RedisSession;
