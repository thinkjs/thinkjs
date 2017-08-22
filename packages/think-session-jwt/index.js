const jwt = require('jsonwebtoken');
const helper = require('think-helper');
const assert = require('assert');
const debug = require('debug')('think-session-jwt');

const sign = helper.promisify(jwt.sign, jwt);
const verify = helper.promisify(jwt.verify, jwt);

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
    assert(options.secret, 'jwt secret is required');
    this.options = options;
    this.ctx = ctx;
    this.data = {};
    this.status = 0;
    this.verifyOptions = options.verify || {};
    this.signOptions = options.sign || {};
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
    this.initPromise = verify(this.options.cookie, this.options.secret, this.verifyOptions).then(content => {
      delete content.iat;
      delete content.exp;
      this.data = content;
    }).catch(err => {
      debug(err);
    });
    this[autoSave]();
    return this.initPromise;
  }

  /**
   * auto save session data when it is change
   */
  [autoSave]() {
    this.ctx.res.once('finish', () => {
      if (this.status === -1) {
        this.ctx.cookie(this.options.name, undefined, this.options);
      } else if (this.status === 1) {
        const maxAge = this.options.maxAge;
        this.signOptions.expiresIn = maxAge ? helper.ms(maxAge, { long: true }) : undefined;
        sign(this.data, this.options.secret, this.signOptions).then(token => {
          this.ctx.cookie(this.options.name, token, this.options);
        }).catch(err => {
          debug(err);
        });
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
