const Keygrip = require('./keygrip.js');
const assert = require('assert');
const helper = require('think-helper');

/**
 * use cookie to store session
 */
class CookieSession {
  /**
   * constructor
   * @param {Object} options cookie options
   * @param {Object} ctx koa ctx
   */
  constructor(options = {}, ctx, cookieOptions = {}) {
    if (cookieOptions.encrypt) {
      assert(cookieOptions.keys && helper.isArray(cookieOptions.keys), '.keys required and must be an array when encrypt is set');
      cookieOptions.signed = false; // disable signed when set encrypt
      this.keygrip = new Keygrip(cookieOptions.keys);
    }
    cookieOptions.overwrite = true;

    this.options = options;
    this.cookieOptions = cookieOptions;

    this.ctx = ctx;
    this.fresh = true; // session data is fresh
    this.data = {}; // session data
    this.maxAge = cookieOptions.maxAge || 0;
    this.expire = 0;
    this.initSessionData();
  }
  /**
   * init session data
   */
  initSessionData() {
    let data = this.ctx.cookie(this.cookieOptions.name, undefined, this.cookieOptions);
    if (data) {
      if (this.keygrip) {
        data = Buffer.from(data, 'base64');
        data = this.keygrip.decrypt(data);
        if (data && data[0]) {
          data = data[0].toString();
        }
      }
      if (data) {
        try {
          const result = JSON.parse(data);
          this.data = result.data || {};
          this.expire = result.expire || 0;
          const offsetTime = this.maxAge - result.maxAge;
          if (offsetTime !== 0) {
            this.expire = +new Date(this.expire) - offsetTime;
          }
          this.fresh = false;
        } catch (e) {}
      }
    }
  }
  /**
   * get session data
   * @param {String} name
   */
  get(name) {
    // auto update cookie when maxAge or expires is set
    if (this.maxAge && this.expire && !this.fresh && this.cookieOptions.autoUpdateRate) {
      const rate = (this.expire - Date.now()) / this.maxAge;
      if (rate < this.cookieOptions.autoUpdateRate) {
        this.set();
      }
    }
    if (name) return Promise.resolve(this.data[name]);
    return Promise.resolve(this.data);
  }
  /**
   * set session data
   * @param {String} name
   * @param {Mixed} value
   */
  set(name, value) {
    if (name) {
      this.data[name] = value;
    }
    let data = JSON.stringify({
      maxAge: this.maxAge,
      expire: Date.now() + this.maxAge,
      data: this.data
    });
    if (this.keygrip) {
      data = this.keygrip.encrypt(data).toString('base64');
    }
    this.cookieOptions.maxAge = this.maxAge;
    this.ctx.cookie(this.cookieOptions.name, data, this.cookieOptions);
    return Promise.resolve();
  }
  /**
   * delete session data
   */
  delete() {
    if (!this.fresh) {
      this.ctx.cookie(this.cookieOptions.name, null, this.cookieOptions);
      this.data = {};
    }
    return Promise.resolve();
  }
}

CookieSession.onlyCookie = true;

module.exports = CookieSession;
