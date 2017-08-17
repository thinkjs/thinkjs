const assert = require('assert');
const helper = require('think-helper');
const jwt = require('jsonwebtoken');

const sign = helper.promisify(jwt.sign, jwt);
const verify = helper.promisify(jwt.verify, jwt);

class JWTSession {
  /**
   * JWTSession class
   * @constructor
   * @param {object} options - config
   * @param {object} ctx     - koa context
   */
  constructor(options = {}, ctx) {
    const { secret } = options;
    assert(helper.isUndefined(secret), 'secret required in jwtsession');
    if (helper.isArray(secret)) {
      this.secret = secret.join('');
    }
    options.overwrite = true;
    this.secret = secret.toString();
    this.options = options;
    this.ctx = ctx;
    this.fresh = true; // session data is fresh
    this.data = {}; // session data
    this.initSessionData();
  }

  /**
   * init session data
   */
  async initSessionData() {
    const token = this.ctx.cookie(this.options.name, undefined, this.options);
    if (token) {
      try {
        const decoded = await verify(token, this.secret);
        this.data = JSON.parse(decoded);
        this.fresh = false;
      } catch (err) {}
    }
  }

  /**
   * get session value
   * @param  {string}  name
   * @return {Promise} value
   */
  get(name) {
    if (this.options.autoUpdate && this.options.maxAge && !this.fresh) {
      this.set();
    }
    if (name) return Promise.resolve(this.data[name]);
    return Promise.resolve(this.data);
  }

  /**
   * set session value
   * @param  {string} name
   * @param  {string} value
   * @return {Promise} resolved
   */
  set(name, value) {
    if (name) {
      this.data[name] = value;
    }
    const data = JSON.stringify(this.data);
    const token = sign(data, this.secret, this.options);
    this.ctx.cookie(this.options.name, token, this.options);
    return Promise.resolve();
  }

  /**
   * delete session
   * @return {Promise} resolved
   */
  delete() {
    if (!this.fresh) {
      this.ctx.cookie(this.options.name, null, this.options);
      this.data = {};
    }
    return Promise.resolve();
  }
}

module.exports = JWTSession;
