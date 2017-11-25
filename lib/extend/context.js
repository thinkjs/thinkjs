const helper = require('think-helper');
const assert = require('assert');
const Cookies = require('cookies');
const url = require('url');

const PARAM = Symbol('context-param');
const POST = Symbol('context-post');
const FILE = Symbol('context-file');
const COOKIE_STORE = Symbol('cookie-store');
const path = require('path');
const fs = require('fs');
const onFinished = require('on-finished');
const destroy = require('destroy');

/**
 * extend context
 */
module.exports = {
  /**
   * get userAgent header
   */
  get userAgent() {
    return this.header['user-agent'];
  },
  /**
   * is get request
   */
  get isGet() {
    return this.method === 'GET';
  },
  /**
   * is post request
   */
  get isPost() {
    return this.method === 'POST';
  },
  /**
   * is command line invoke
   */
  get isCli() {
    return this.method === 'CLI';
  },
  /**
   * get referer header
   */
  referer(onlyHost) {
    return this.referrer(onlyHost);
  },
  /**
   * get referer header
   */
  referrer(onlyHost) {
    const referrer = this.header['referer'];
    if (!referrer || !onlyHost) return referrer;
    return url.parse(referrer).hostname;
  },
  /**
   * is method
   */
  isMethod(method) {
    return this.method === method.toUpperCase();
  },
  /**
   * is ajax request
   */
  isAjax(method) {
    if (method && !this.isMethod(method)) return false;
    return this.header['x-requested-with'] === 'XMLHttpRequest';
  },
  /**
   * is jsonp request
   */
  isJsonp(callbackField = this.config('jsonpCallbackField')) {
    return !!this.param(callbackField);
  },
  /**
   * send jsonp data
   */
  jsonp(data, callbackField = this.config('jsonpCallbackField')) {
    let field = this.param(callbackField);
    // remove unsafe chars
    field = (field || '').replace(/[^\w.]/g, '');
    if (field) {
      data = `${field}(${JSON.stringify(data)})`;
    }
    this.type = this.config('jsonpContentType');
    this.body = data;
    return false;
  },
  /**
   * send json data
   */
  json(data) {
    this.type = this.config('jsonContentType');
    this.body = data;
    return false;
  },
  /**
   * send success data
   */
  success(data = '', message = '') {
    const obj = {
      [this.config('errnoField')]: 0,
      [this.config('errmsgField')]: message,
      data
    };
    this.type = this.config('jsonContentType');
    this.body = obj;
    return false;
  },
  /**
   * send fail data
   */
  fail(errno, errmsg = '', data = '') {
    let obj;
    if (helper.isObject(errno)) {
      obj = errno;
    } else {
      if (/^[A-Z_]+$/.test(errno)) {
        const messages = think.app.validators.messages || {};
        const msg = messages[errno];
        if (think.isArray(msg)) {
          [errno, errmsg] = msg;
        }
      }
      if (!think.isNumber(errno)) {
        [data, errmsg, errno] = [errmsg, errno, this.config('defaultErrno')];
      }
      obj = {
        [this.config('errnoField')]: errno,
        [this.config('errmsgField')]: errmsg
      };
      if (data) {
        obj.data = data;
      }
    }
    this.type = this.config('jsonContentType');
    this.body = obj;
    return false;
  },
  /**
   * set expires header
   */
  expires(time) {
    time = helper.ms(time);
    const date = new Date(Date.now() + time);
    this.set('Cache-Control', `max-age=${time}`);
    this.set('Expires', date.toUTCString());
  },
  /**
   * get or set configs
   * @param {String} name
   * @param {Mixed} value
   * @param {String} m
   */
  config(name, value, m = this.module) {
    return think.config(name, value, m);
  },
  /**
   * get or set query data
   * `query` or `get` is already used in koa
   * @param {String} name
   * @param {Mixed} value
   */
  param(name, value) {
    if (!this[PARAM]) {
      this[PARAM] = Object.assign({}, this.request._query || this.request.query);
      this.app.emit('filterParam', this[PARAM]);
    }
    if (!name) return this[PARAM];
    if (helper.isObject(name)) {
      this[PARAM] = Object.assign(this[PARAM], name);
      return this;
    }
    assert(name && helper.isString(name), 'param.name must be a string');
    if (value === undefined) {
      // this.param('a,b')
      if (name.indexOf(',') > -1) {
        const value = {};
        name.split(',').forEach(item => {
          value[item] = this[PARAM][item];
        });
        return value;
      }
      return this[PARAM][name];
    }
    this[PARAM][name] = value;
    return this;
  },
  /**
   * get or set post data
   * @param {String} name
   * @param {Mixed} value
   */
  post(name, value) {
    if (!this[POST]) {
      const json = this.request.body && this.request.body.post;
      this[POST] = think.isArray(json) ? Array.from(json) : Object.assign({}, json);
      this.app.emit('filterParam', this[POST]);
    }
    if (!name) return this[POST];
    if (helper.isObject(name)) {
      this[POST] = Object.assign(this[POST], name);
      return this;
    }
    if (value === undefined) {
      // this.param('a,b')
      if (name.indexOf(',') > -1) {
        const value = {};
        name.split(',').forEach(item => {
          value[item] = this[POST][item];
        });
        return value;
      }
      return this[POST][name];
    }
    this[POST][name] = value;
    return this;
  },
  /**
   * get or set file data
   * @param {String} name
   * @param {Mixed} value
   */
  file(name, value) {
    if (!this[FILE]) {
      this[FILE] = Object.assign({}, this.request.body && this.request.body.file);
    }
    if (!name) return this[FILE];
    if (helper.isObject(name)) {
      this[FILE] = Object.assign(this[FILE], name);
      return this;
    }
    if (value === undefined) {
      return this[FILE][name];
    }
    this[FILE][name] = value;
    return this;
  },
  /**
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
   * get service
   * @param {String} name
   * @param {String} m
   */
  service(...args) {
    return think.service(...args);
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
};
