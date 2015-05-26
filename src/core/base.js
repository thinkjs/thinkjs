'use strict';
/**
 * Base Class
 * @param  {Object} http
 * @return {Class}
 */
export default class {
  /**
   * constructor
   * @param  {Object} http []
   * @return {}      []
   */
  constructor(...args){
    this.init(...args);
  }
  /**
   * init
   * @param  {Object} http []
   * @return {}      []
   */
  init(http = {}){
    this.http = http;
  }
  /**
   * invoke method, support __before & __after magic methods
   * @param  {String} method []
   * @param  {mixed} data []
   * @return {Promise}     []
   */
  async invoke(method, data = []){
    if (think.isFunction(this.__before)) {
      await think.co.wrap(this.__before).bind(this)(this);
    }
    await think.co.wrap(this[method]).apply(this, data);
    if (think.isFunction(this.__after)) {
      await think.co.wrap(this.__after).bind(this)(this);
    }
  }
  /**
   * get or set config
   * @param  {string} name  [config name]
   * @param  {mixed} value [config value]
   * @return {mixed}       []
   */
  config(name, value){
    return think.config(name, value, this.http._config);
  }
  /**
   * invoke action
   * @param  {Object} controller [controller instance]
   * @param  {String} action     [action name]
   * @param  {Mixed} data       [action params]
   * @return {}            []
   */
  action(controller, action){
    if (think.isString(controller)) {
      controller = this.controller(controller);
    }
    if (action !== '__call') {
      action += think.config('action_suffix');
    }
    return controller.invoke(action, [controller]);
  }
  /**
   * get or set cache
   * @param  {String} name    [cache name]
   * @param  {mixed} value   [cache value]
   * @param  {Object} options [cache options]
   * @return {}         []
   */
  cache(name, value, options){
    options = think.extend({}, this.config('cache'), options);
    return think.cache(name, value, options);
  }
  /**
   * invoke hook
   * @param  {String} event [event name]
   * @return {Promise}       []
   */
  hook(event, data){
    return think.hook(event, this.http, data);
  }
  /**
   * get model
   * @param  {String} name    [model name]
   * @param  {Object} options [model options]
   * @return {Object}         [model instance]
   */
  model(name = 'base', options = {}){
    options = think.extend({}, this.config('db'), options);
    return think.model(name, options, this.http.module);
  }
  /**
   * get controller
   * this.controller('home/controller/test')
   * @param  {String} name [controller name]
   * @return {Object}      []
   */
  controller(name){
    let Cls = think.lookClass(name, 'controller', this.http.module);
    return new Cls(this.http);
  }
  /**
   * get service
   * @param  {String} name [service name]
   * @return {Object}      []
   */
  service(name){
    return think.service(name, this.http, this.http.module);
  }
}