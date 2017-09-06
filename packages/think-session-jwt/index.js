const jwt = require('jsonwebtoken');
const helper = require('think-helper');
const assert = require('assert');

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
      const { tokenType = 'cookie', tokenName = 'jwt' } = this.options;
      switch (tokenType) {
        case 'header':
          token = this.ctx.headers[tokenName];
          break;
        case 'body':
          token = this.ctx.post(tokenName);
          break;
        case 'query':
          token = this.ctx.query[tokenName];
          break;
        default :
          token = this.ctx.cookie(tokenName, undefined, this.options);
          break;
      }
      if (token) {
        this.data = await verify(token, this.options.secret, this.verifyOptions);
        this.fresh = false;
      }
    }
  }

  /**
   * auto save session data when it is change
   */
  async autoSave() {
    const data = helper.extend({}, this.data);
    delete data.exp;
    delete data.iat;
    delete data.nbf;
    delete data.aud;
    delete data.sub;
    delete data.iss;
    delete data.jti;
    delete data.alg;
    const token = await sign(data, this.options.secret, this.signOptions);
    return token;
  }

  /**
   * get session value
   * @param  {string}  name
   * @return {Promise} value
   */
  async get(name) {
    await this.initSessionData();
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
    const token = await this.autoSave();
    return token;
  }

  /**
   * delete session
   * @return {Promise} resolved
   */
  async delete() {
    await this.initSessionData();
    this.data = {};
  }
}

module.exports = JWTSession;
