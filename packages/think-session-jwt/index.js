const jwt = require('jsonwebtoken');
const helper = require('think-helper');
const ms = require('ms');
const assert = require('assert');
const debug = require('debug')('think-session-jwt');

const sign = helper.promisify(jwt.sign, jwt);
const verify = helper.promisify(jwt.verify, jwt);

class JWTSession {
  /**
   * JWTSession class
   * @constructor
   * @param {object} options - config
   * @param {object} ctx     - koa context
   */
  constructor(options, ctx) {
    assert(options && options.secret, 'jwt secret is required');
    this.options = options;
    this.ctx = ctx;
    this.data = {};
    this.fresh = true;
    this.verifyOptions = options.verify || {};
    this.signOptions = options.sign || {};
  }

  /**
   * init session data
   */
  async initSessionData() {
    if (this.fresh) {
      let token;
      const { getType, getTokenName = 'jwt' } = this.options;
      switch (getType) {
        case 'header':
          token = this.ctx.headers[getTokenName];
          break;
        case 'body':
          token = this.ctx.post(getTokenName);
          break;
        case 'query':
          token = this.ctx.query[getTokenName];
          break;
        default :
          token = this.ctx.cookie(this.options.name, undefined, this.options);
          break;
      }
      if (token) {
        try {
          const decoded = await verify(token, this.options.secret, this.verifyOptions);
          delete decoded.iat;
          delete decoded.exp;
          this.data = decoded;
          this.fresh = false;
        } catch (err) {
          debug(err);
        }
      }
    }
  }

  /**
   * auto save session data when it is change
   */
  async autoSave() {
    try {
      const maxAge = this.options.maxAge;
      this.signOptions.expiresIn = maxAge ? ms(maxAge) : '1d';
      const token = await sign(this.data, this.options.secret, this.signOptions);
      const { setType, setTokenName = 'x-jwt-token' } = this.options;
      switch (setType) {
        case 'header':
          this.ctx.set({
            [setTokenName]: token
          });
          break;
        default :
          this.ctx.cookie(this.options.name, token, this.options);
          break;
      }
    } catch (err) {}
  }

  /**
   * get session value
   * @param  {string}  name
   * @return {Promise} value
   */
  async get(name) {
    await this.initSessionData();
    if (this.options.autoUpdate && this.options.maxAge && !this.fresh) {
      await this.autoSave();
    }
    return name ? this.data[name] : this.data;
  }

  /**
   * set session value
   * @param  {string} name
   * @param  {string} value
   * @return {Promise} resolved
   */
  async set(name, value) {
    await this.initSessionData();
    if (name) {
      this.data[name] = value;
    }
    await this.autoSave();
  }

  /**
   * delete session
   * @return {Promise} resolved
   */
  async delete() {
    await this.initSessionData();
    if (!this.fresh) {
      const { setType, setTokenName = 'x-jwt-token' } = this.options;
      switch (setType) {
        case 'header':
          this.ctx.set({
            [setTokenName]: null
          });
          break;
        default :
          this.ctx.cookie(this.options.name, null, this.options);
          break;
      }
      this.data = {};
    }
  }
}

JWTSession.onlyCookie = true;

module.exports = JWTSession;
