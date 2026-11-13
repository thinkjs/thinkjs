const helper = require('think-helper');
const assert = require('assert');
const Cookies = require('cookies');

const COOKIE_STORE = Symbol('cookie-store');
const path = require('path');
const fs = require('fs');
const onFinished = require('on-finished');
const destroy = require('destroy');

const context = require('../core/context');

module.exports = Object.defineProperties({  /**
   * get or set cookie
   * @param {String} name
   * @param {String} value
   * @param {Object} options
   */
  cookie(name, value, options = {}) {
    assert(name && helper.isString(name), 'cookie.name must be a string');
    options = Object.assign({}, this.config('cookie'), options);
    const instance = new Cookies(this.req, this.res, {
      keys: options.keys,
      secure: this.request.secure
    });

    if (!this[COOKIE_STORE]) this[COOKIE_STORE] = {};

    // get cookie
    if (value === undefined) {
      if (this[COOKIE_STORE][name] !== undefined) return this[COOKIE_STORE][name];
      return instance.get(name, options);
    }
    // remove cookie
    if (value === null) {
      delete this[COOKIE_STORE][name];
      // If the value is omitted, an outbound header with an expired date is used to delete the cookie.
      // https://github.com/pillarjs/cookies#cookiesset-name--value---options--
      return instance.set(name, undefined, options);
    }
    assert(helper.isString(value), 'cookie value must be a string');
    // http://browsercookielimits.squawky.net/
    if (value.length >= 4094) {
      this.app.emit('cookieLimit', {name, value, ctx: this});
    }
    this[COOKIE_STORE][name] = value;
    // set cookie
    return instance.set(name, value, options);
  },
  /**
   * download
   * @param {String} filepath
   * @param {String} filename
   */
  download(filepath, filename = path.basename(filepath)) {
    assert(filepath, 'filepath can not be empty');
    const contentType = this.response.get('Content-Type');
    if (!contentType) {
      this.type = path.extname(filename);
    }
    const contentDisposition = this.response.get('Content-Disposition');
    if (!contentDisposition) {
      this.attachment(filename);
    }
    const stream = fs.createReadStream(filepath);
    this.body = stream;
    onFinished(this.res, () => {
      destroy(stream);
    });
    return false;
  }
}, Object.getOwnPropertyDescriptors(context));
