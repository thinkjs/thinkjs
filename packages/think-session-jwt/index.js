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
    this.decode = {};
    this.encode = {};
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
      const { tokenType, tokenName = 'jwt' } = this.options;
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
        this.decode = await verify(token, this.options.secret, this.verifyOptions);
        this.fresh = false;
      }
    }
  }

  /**
   * auto save session data when it is change
   */
  async autoSave() {
    const token = await sign(this.encode, this.options.secret, this.signOptions);
    return token;
  }

  /**
   * get session value
   * @param  {string}  name
   * @return {Promise} value
   */
  async get(name) {
    await this.initSessionData();
    return name ? this.decode[name] : this.decode;
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
      this.encode[name] = value;
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
    this.decode = {};
  }
}

module.exports = JWTSession;
