const helper = require('think-helper');
const assert = require('assert');
const cookies = require('cookies');
const url = require('url');

const PARAM = Symbol('context-param');
const POST = Symbol('context-post');
const FILE = Symbol('context-file');

/**
 * extend context
 */
module.exports = {
  /**
   * get userAgent header
   */
  get userAgent(){
    return this.header['user-agent'];
  },
  /**
   * get referer header
   */
  referer(onlyHost){
    return this.referrer(onlyHost);
  },
  /**
   * get referer header
   */
  referrer(onlyHost){
    let referrer = this.header['referer'];
    if(!referrer || !onlyHost) return referrer;
    return url.parse(referrer).hostname;
  },
  /**
   * is get request
   */
  get isGet(){
    return this.method === 'GET';
  },
  /**
   * is post request
   */
  get isPost(){
    return this.method === 'POST';
  },
  /**
   * is method
   */
  isMethod(method){
    return this.method === method.toUpperCase();
  },
  /**
   * is command line invoke
   */
  get isCli(){
    return this.isMethod('cli');
  },
  /**
   * is ajax request
   */
  isAjax(method){
    if(method && !this.isMethod(method)) return false;
    return this.header['x-requested-with'] === 'XMLHttpRequest';
  },
  /**
   * is jsonp request
   */
  isJsonp(callbackField = this.config('jsonpCallbackField')){
    return !!this.param(callbackField);
  },
  /**
   * send jsonp data
   */
  jsonp(data, callbackField = this.config('jsonpCallbackField')){
    let field = this.param(callbackField);
    //remove unsafe chars
    field = (field || '').replace(/[^\w\.]/g, '');
    if(field){
      data = `${field}(${JSON.stringify(data)})`;
    }
    this.type = this.config('jsonContentType');
    this.body = data;
    return false;
  },
  /**
   * send json data
   */
  json(data){
    this.type = this.config('jsonContentType');
    this.body = data;
    return false;
  },
  /**
   * send success data
   */
  success(data = '', message = ''){
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
  fail(errno, errmsg = '', data = ''){
    let obj;
    if(helper.isObject(errno)){
      obj = errno;
    }else{
      // if(/^[A-Z\_]+$/.test(errno)){
      //   let msg = this.locale(errno);
      //   if(think.isArray(msg)){
      //     errno = msg[0];
      //     errmsg = msg[1];
      //   }
      // }
      if (!think.isNumber(errno)) {
        data = errmsg;
        errmsg = errno;
        errno = this.config('defaultErrno');
      }
      // if(!errmsg){
      //   errmsg = this.locale(errno) || '';
      // }
      obj = {
        [this.config('errnoField')]: errno,
        [this.config('errmsgField')]: errmsg
      };
      if(data){
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
  expires(time){
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
    if(!this[PARAM]){
      this[PARAM] = Object.assign({}, this.query);
    }
    if(name === undefined && value === undefined) {
      return this[PARAM];
    }
    if(helper.isObject(name)){
      this[PARAM] = Object.assign(this[PARAM], name);
      return this;
    }
    assert(name && helper.isString(name), 'param.name must be a string');
    if(value === undefined){
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
  post(name, value){
    if(!this[POST]){
      this[POST] = this.request.body && this.request.body.post || {};
    }
    if(name === undefined && value === undefined) {
      return this[POST];
    }
    if(!name) return this[POST];
    if(helper.isObject(name)){
      this[POST] = Object.assign(this[POST], name);
      return this;
    }
    if(value === undefined){
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
  file(name, value){
    if(!this[FILE]){
      this[FILE] = this.request.body && this.request.body.file || {};
    }
    if(!name) return this[FILE];
    if(helper.isObject(name)){
      this[FILE] = Object.assign(this[FILE], name);
      return this;
    }
    if(value === undefined){
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
  cookie(name, value, options = {}){
    assert(name && helper.isString(name), 'cookie.name must be a string');
    options = Object.assign({}, this.config('cookie'), options);
    const instance = new cookies(this.req, this.res, {
      keys: options.keys,
      secure: this.req.secure
    });
    //get cookie
    if(value === undefined){
      return instance.get(name, options);
    }
    //remove cookie
    if(value === null){
      return instance.set(name, '', {
        maxAge: -1
      });
    }
    assert(helper.isString(value), 'cookie value must be a string');
    //http://browsercookielimits.squawky.net/
    if(value.length >= 4094){
      this.app.emit('cookieLimit', {name, value, ctx: this});
    }
    //set cookie
    return instance.set(name, value, options);
  },
  /**
   * get model instance
   * @param {String} name
   * @param {String|Object} config
   * @param {String} m
   */
  model(name, config, m = this.module){
    config = helper.parseAdapterConfig(this.config('model'), config);
    //add adapter cache config
    config.cache = helper.parseAdapterConfig(this.config('cache'), config.cache);
    return think.model(name, config, m);
  },
  /**
   * get controller instance
   * @param {String} name
   * @param {String} m
   */
  controller(name, m){
    return think.controller(name, this, m);
  },
  /**
   * get service
   * @param {String} name
   * @param {String} m
   */
  service(name, m){
    return think.service(name, m);
  }
}
