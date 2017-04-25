const deprecate = require('depd')('thinkjs');

/**
 * extend controller
 */
module.exports = {
  /**
   * get or set config
   * @param {String} name 
   * @param {Mix} value 
   * @param {String} m 
   */
  config(name, value, m = this.ctx.module){
    return think.config(name, value, m);
  },
  /**
   * get request method
   */
  get method(){
    return this.ctx.method.toLowerCase();
  },
  /**
   * is method
   * @param {String} method 
   */
  isMethod(method){
    return this.method() === method;
  },
  /**
   * is get method
   */
  isGet(){
    return this.method() === 'get';
  },
  /**
   * is post method
   */
  isPost(){
    return this.method === 'post';
  },
  /**
   * check if is ajax request
   * @param {String} method 
   */
  isAjax(method){
    if(method && !this.method(method)){
      return false;
    }
    return this.header('x-requested-with') === 'XMLHttpRequest';
  },
  isJsonp(callback){

  },
  /**
   * is jsonp request
   */
  isJsonp(){

  },
  jsonp(){

  },
  /**
   * 
   * @param {String} name 
   * @param {Mixed} value 
   */
  get(name, value){
    deprecate('controller.get is deprecate, please use controller.query instead. it will removed in ThinkJS 3.1');
    return this.ctx.param(name, value);
  },
  /**
   * get query data
   * @param {String} name 
   * @param {Mixed} value 
   */
  query(name, value){
    return this.ctx.param(name, value);
  },
  /**
   * get or set post data
   * @param {String} name 
   * @param {Mixed} value 
   */
  post(name, value){
    return this.ctx.post(name, value);
  },
  /**
   * get or set file data
   * @param {String} name 
   * @param {Mixed} value 
   */
  file(name, value){
    return this.ctx.file(name, value);
  },
  /**
   * get or set cookies
   * @param {String} name 
   * @param {String} value 
   * @param {Object} options 
   */
  cookie(name, value, options){
    return this.ctx.cookie(name, value, options);
  },
  /**
   * get or set header
   * @param {String} name 
   * @param {Mixed} value 
   */
  header(name, value){

  },
  /**
   * get userAgent header
   */
  get userAgent(){
    return this.ctx.userAgent;
  },
  /**
   * get referer header
   */
  referrer(onlyHost){
    return this.ctx.referer(onlyHost);
  },
  /**
   * get referer header
   */
  referer(onlyHost){
    return this.ctx.referer(onlyHost);
  },
  /**
   * Perform a 302 redirect to `url`.
   * @param {String} url 
   * @param {String} alt 
   */
  redirect(url, alt){
    return this.ctx.redirect(url, alt);
  }
}