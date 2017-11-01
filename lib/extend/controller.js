const helper = require('think-helper');
const debug = require('debug')('thinkjs');
const assert = require('assert');
/**
 * extend controller
 */
module.exports = {
  /**
   * body getter
   */
  get body() {
    return this.ctx.body;
  },
  /**
   * body setter
   */
  set body(value) {
    this.ctx.body = value;
  },
  /**
   * get client ip
   */
  get ip() {
    return this.ctx.ip;
  },
  /**
   * get client ips
   */
  get ips() {
    return this.ctx.ips;
  },
  /**
   * get status code
   */
  get status() {
    return this.ctx.status;
  },
  /**
   * set status code
   */
  set status(status) {
    this.ctx.status = status;
  },
  /**
   * get content type
   */
  get type() {
    return this.ctx.type;
  },
  /**
   * set content type
   */
  set type(contentType) {
    this.ctx.type = contentType;
  },
  /**
   * get userAgent header
   */
  get userAgent() {
    return this.ctx.userAgent;
  },
  /**
   * get request method
   */
  get method() {
    return this.ctx.method;
  },
  /**
   * is get method
   */
  get isGet() {
    return this.ctx.isGet;
  },
  /**
   * is post method
   */
  get isPost() {
    return this.ctx.isPost;
  },
  /**
   * is command line invoke
   */
  get isCli() {
    return this.ctx.isCli;
  },
  /**
   * get or set config
   * @param {String} name
   * @param {Mix} value
   * @param {String} m
   */
  config(name, value, m = this.ctx.module) {
    return think.config(name, value, m);
  },
  /**
   * is method
   * @param {String} method
   */
  isMethod(method) {
    return this.ctx.isMethod(method);
  },
  /**
   * check if is ajax request
   * @param {String} method
   */
  isAjax(method) {
    return this.ctx.isAjax(method);
  },
  /**
   * is jsonp request
   * @param {String} callback
   */
  isJsonp(callbackField) {
    return this.ctx.isJsonp(callbackField);
  },
  /**
   * send jsonp data
   */
  jsonp(data, callbackField) {
    return this.ctx.jsonp(data, callbackField);
  },
  /**
   * send json data
   */
  json(data) {
    return this.ctx.json(data);
  },
  /**
   * send success data
   */
  success(data, message) {
    return this.ctx.success(data, message);
  },
  /**
   * send fail data
   */
  fail(errno, errmsg, data) {
    return this.ctx.fail(errno, errmsg, data);
  },
  /**
   * set expires header
   * @param {Number} time
   */
  expires(time) {
    return this.ctx.expires(time);
  },
  /**
   * get query data
   * @param {String} name
   * @param {Mixed} value
   */
  get(name, value) {
    return this.ctx.param(name, value);
  },
  /**
   * get query data
   * @param {String} name
   * @param {Mixed} value
   */
  query(name, value) {
    return this.ctx.param(name, value);
  },
  /**
   * get or set post data
   * @param {String} name
   * @param {Mixed} value
   */
  post(name, value) {
    return this.ctx.post(name, value);
  },
  /**
   * get or set file data
   * @param {String} name
   * @param {Mixed} value
   */
  file(name, value) {
    return this.ctx.file(name, value);
  },
  /**
   * get or set cookies
   * @param {String} name
   * @param {String} value
   * @param {Object} options
   */
  cookie(name, value, options) {
    return this.ctx.cookie(name, value, options);
  },
  /**
   * get or set header
   * @param {String} name
   * @param {Mixed} value
   */
  header(name, value) {
    if (value === undefined && helper.isString(name)) {
      return this.ctx.header[name];
    }
    if (this.ctx.res.headersSent) {
      debug(`headers has already sent, url: ${this.ctx.url}`);
      return;
    }
    if (value !== undefined) {
      return this.ctx.set(name, value);
    }
    if (helper.isObject(name)) {
      return this.ctx.set(name);
    }
  },
  /**
   * get referer header
   */
  referrer(onlyHost) {
    return this.ctx.referer(onlyHost);
  },
  /**
   * get referer header
   */
  referer(onlyHost) {
    return this.ctx.referer(onlyHost);
  },
  /**
   * Perform a 302 redirect to `url`.
   * @param {String} url
   * @param {String} alt
   */
  redirect(url, alt) {
    this.ctx.redirect(url, alt);
    return false;
  },
  /**
   * get controller instance
   * @param {String} name
   * @param {String} m
   */
  controller(name, m = this.ctx.module) {
    let mcls = think.app.controllers;
    if (this.ctx.app.modules.length) {
      mcls = think.app.controllers[m || 'common'] || {};
    }
    const Cls = mcls[name];
    assert(Cls, `can not find controller: ${name}`);
    return new Cls(this.ctx);
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
   * execute action
   * @param {String} controller
   * @param {String} actionName
   * @param {String} m
   */
  action(controller, actionName, m) {
    let instance = controller;
    // if controller is an controller instance, ignore invoke controller method
    if (helper.isString(controller)) {
      instance = this.controller(controller, m);
    }
    let promise = Promise.resolve();
    if (instance.__before) {
      promise = Promise.resolve(instance.__before());
    }
    return promise.then(data => {
      if (data === false) return false;
      let method = `${actionName}Action`;
      if (!instance[method]) {
        method = '__call';
      }
      if (instance[method]) return instance[method]();
    }).then(data => {
      if (data === false) return false;
      if (instance.__after) return instance.__after();
      return data;
    });
  },
  /**
   * download
   * @param {String} filepath
   * @param {String} filename
   */
  download(filepath, filename) {
    return this.ctx.download(filepath, filename);
  }
};
