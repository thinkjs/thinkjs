'use strict';
/**
 * Base Class
 * all class will inherit this class
 * @param  {Object} http 
 * @return {Class}   
 */

module.exports = think.Class({
  /**
   * init
   * @param  {Object} http [http object]
   * @return {}      []
   */
  init: function(http){
    this.http = http || {};
  },
  /**
   * invoke method, support __before & __after magic methods
   * @param  {String} method []
   * @param  {mixed} data []
   * @return {Promise}     []
   */
  invoke: function(method, data){
    var promise = Promise.resolve(), fn, self = this;
    if (think.isFunction(this.__before)) {
      promise = think.co.wrap(this.__before).bind(self)();
    }
    promise = promise.then(function(){
      fn = think.co.wrap(self[method]);
      return fn.apply(self, data || []);
    });
    if (think.isFunction(this.__after)) {
      promise = promise.then(function(){
        return think.co.wrap(self.__after).bind(self)();
      })
    }
    return promise;
  },
  /**
   * get or set config
   * @param  {string} name  [config name]
   * @param  {mixed} value [config value]
   * @return {mixed}       []
   */
  config: function(name, value){
    return think.config(name, value, this.http._config);
  },
  /**
   * invoke action
   * @param  {Object} controller [controller instance]
   * @param  {String} action     [action name]
   * @param  {Mixed} data       [action params]
   * @return {}            []
   */
  action: function(controller, action){
    if (think.isString(controller)) {
      controller = this.controller(controller);
    }
    if (action !== '__call') {
      action += think.config('action_suffix');
    }
    return controller.invoke(action, [controller]);
  },
  /**
   * get or set cache
   * @param  {String} name    [cache name]
   * @param  {mixed} value   [cache value]
   * @param  {Object} options [cache options]
   * @return {}         []
   */
  cache: function(name, value, options){
    options = think.extend({}, this.config('cache'), options);
    return think.cache(name, value, options);
  },
  /**
   * invoke hook
   * @param  {String} event [event name]
   * @return {Promise}       []
   */
  hook: function(event, data){
    return think.hook(event, this.http, data);
  },
  /**
   * get model
   * @param  {String} name    [model name]
   * @param  {Object} options [model options]
   * @return {Object}         [model instance]
   */
  model: function(name, options){
    options = think.extend({}, this.config('db'), options);
    return think.model(name, options, this.http.module)
  },
  /**
   * get controller
   * this.controller('home/controller/test')
   * @param  {String} name [controller name]
   * @return {Object}      []
   */
  controller: function(name){
    var cls = think.lookClass(name, 'controller', this.http.module);
    return cls(this.http);
  },
  /**
   * get service
   * @param  {String} name [service name]
   * @return {Object}      []
   */
  service: function(name){
    return think.service(name, this.http, this.http.module);
  }
}, true)