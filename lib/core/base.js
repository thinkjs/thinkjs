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
   * get class
   * @param  {String} type []
   * @param  {String} name []
   * @return {Class}      []
   */
  _getClass: function(type, name){
    name = name.split('/');
    var length = name.length, cls;
    if (length === 1) {
      name = this.http.module + '/' + think.dirname[type] + '/' + name[0];
      if (!think.mini) {
        cls = think.require(name, true);
        if (cls) {
          return cls;
        }
        name = think.dirname.common + '/' + think.dirname[type] + '/' + name[0];
      }
    }else if (length === 2) {
      name = name[0] + '/' + think.dirname[type] + '/' + name[1];
    }
    return think.require(name);
  },
  /**
   * get model
   * @param  {String} name    [model name]
   * @param  {Object} options [model options]
   * @return {Object}         [model instance]
   */
  model: function(name, options){
    var cls = this._getClass('model', name);
    options = think.extend({}, this.config('db'), options);
    return cls(options);
  },
  /**
   * get controller
   * @param  {String} name [controller name]
   * @return {Object}      []
   */
  controller: function(name){
    return this._getClass('controller', name)(this.http);
  },
  /**
   * get service
   * @param  {String} name [service name]
   * @return {Object}      []
   */
  service: function(name){
    var cls = this._getClass('service');
    if (think.isFunction(cls)) {
      return cls(this.http);
    }
    return cls;
  }
}, true)