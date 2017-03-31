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
      this[POST] = {};
    }
    if(helper.isObject(name)){
      this[POST] = Object.assign(this[POST], name);
      return this;
    }
    assert(name && helper.isString(name), 'post.name must be a string');
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
      this[FILE] = {};
    }
    if(helper.isObject(name)){
      this[FILE] = Object.assign(this[FILE], name);
      return this;
    }
    assert(name && helper.isString(name), 'file.name must be a string');
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
  }
}