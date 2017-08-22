const jwt = require('jsonwebtoken');
const helper = require('think-helper');
const assert = require('assert');
const debug = require('debug')('think-session-jet');

const sign = helper.promisify(jwt.sign, jwt);
const verify = helper.promisify(jwt.verify, jwt);

// decode is a sync method, do not use it
// const decode = jwt.decode;

const initSessionData = Symbol('think-session-jwt-init');
const autoSave = Symbol('think-session-jwt-save');

class JWTSession {
  /**
   * JWTSession class
   * @constructor
   * @param {object} options - config
   * @param {object} ctx     - koa context
   */
  constructor(options = {}, ctx) {
    assert(options.name, 'cookie name is required');
    assert(options.secret, 'jwt secret is required');
    this.options = options;
    this.ctx = ctx;
    this.data = {};
    this.status = 0;
  }

  /**
   * init session data
   */
  [initSessionData]() {
    if (this.initPromise) {
      return this.initPromise;
    }
    if (this.options.fresh || this.status === -1) {
      this.initPromise = Promise.resolve();
      return this.initPromise;
    }
    this.initPromise = verify(this.options.cookie, this.options.secret, this.options.verifyOptions).then(content => {
      content = JSON.parse(content);
      if (helper.isEmpty(content)) return;
      this.data = content;
    }).catch(err => debug(err));
    this[autoSave]();
    return this.initPromise;
  }

  /**
   * auto save session data when it is change
   */
  [autoSave]() {
    this.ctx.res.once('finish', async function() {
      if (this.status === -1) {
        this.ctx.cookie(this.options.name, undefined, this.options);
      } else if (this.status === 1) {
        let maxAge = this.options.maxAge;
        maxAge = this.options.maxAge ? helper.ms(maxAge, { long: true }) : undefined;
        const token = await sign(this.data, this.options.secret, { maxAge });
        this.ctx.cookie(this.options.name, token, this.options);
      }
    });
  }

  /**
   * get session value
   * @param  {string}  name
   * @return {Promise} value
   */
  get(name) {
    return this[initSessionData]().then(() => {
      if (this.options.autoUpdate) {
        this.status = 1;
      }
      return name ? this.data[name] : this.data;
    });
  }

  /**
   * set session value
   * @param  {string} name
   * @param  {string} value
   * @return {Promise} resolved
   */
  set(name, value) {
    return this[initSessionData]().then(() => {
      this.status = 1;
      this.data[name] = value;
    });
  }

  /**
   * delete session
   * @return {Promise} resolved
   */
  delete() {
    this.status = -1;
    this.data = {};
    return Promise.resolve();
  }
}

module.exports = JWTSession;
