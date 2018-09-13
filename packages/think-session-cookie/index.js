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
  constructor(options = {}, ctx) {
    if (options.encrypt) {
      assert(options.keys && helper.isArray(options.keys), '.keys required and must be an array when encrypt is set');
      options.signed = false; // disable signed when set encrypt
      this.keygrip = new Keygrip(options.keys);
    }
    options.overwrite = true;
    this.options = options;
    this.ctx = ctx;
    this.fresh = true; // session data is fresh
    this.data = {}; // session data
    this.maxAge = options.maxAge || 0;
    this.expire = 0;
    this.initSessionData();
  }
  /**
   * init session data
   */
  initSessionData() {
    let data = this.ctx.cookie(this.options.name, undefined, this.options);
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
          this.maxAge = result.maxAge || 0;
          this.expire = result.expire || 0;
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
    if (this.maxAge && this.expire && !this.fresh && this.options.autoUpdateRate) {
      const rate = (this.expire - Date.now()) / this.maxAge;
      if (rate < this.options.autoUpdateRate) {
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
    this.options.maxAge = this.maxAge;
    this.ctx.cookie(this.options.name, data, this.options);
    return Promise.resolve();
  }
  /**
   * delete session data
   */
  delete() {
    if (!this.fresh) {
      this.ctx.cookie(this.options.name, null, this.options);
      this.data = {};
    }
    return Promise.resolve();
  }
}

CookieSession.onlyCookie = true;

module.exports = CookieSession;
