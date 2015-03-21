'use strict';
/**
 * Base Class
 * @param  {Object} http 
 * @return {Class}   
 */
module.exports = think.Class({
  /**
   * init
   * @param  {Object} http []
   * @return {}      []
   */
  init: function(http){
    this.http = http || {};
  },
  /**
   * invoke method, support __before & __after
   * @param  {} method []
   * @return {}        []
   */
  invoke: function(method, data){
    var promise = Promise.resolve(), fn, self = this;
    if (think.isFunction(this.__before)) {
      promise = think.co.wrap(this.__before)();
    }
    promise = promise.then(function(){
      fn = think.co.wrap(self[method]);
      return fn.apply(self, data || []);
    });
    if (think.isFunction(this.__after)) {
      promise = promise.then(function(){
        return think.co.wrap(self.__after)();
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
    return think.config(name, value, this.http.config);
  },
  /**
   * get model instance
   * @param  {String} model [model name]
   * @return {Object}       [model instance]
   */
  model: function(model){
    if (model.indexOf('/model/') === -1) {
      model = this.http.module + '/model/' + model;
    }
    var cls = think.require(model);
    return cls(this.http);
  },
  /**
   * get controller instance
   * @param  {String} controller []
   * @return {Object}            []
   */
  controller: function(controller){
    if (isFunction(controller)) {
      return controller(this.http);
    }else if (isObject(controller)) {
      return controller;
    }
    if (controller.indexOf('/controller/') === -1) {
      controller = this.http.module + '/controller/' + controller;
    }
    var cls = think.require(controller);
    return cls(this.http);
  },
  /**
   * [action description]
   * @param  {[type]} action [description]
   * @return {[type]}        [description]
   */
  action: function(controller, action, data, options){
    controller = this.controller(controller);
    options = options || {};
    var promise = Promise.resolve(controller.__initReturn);
    var act = action + this.config('action_suffix');
    
  },
  /**
   * get or set cache
   * @param  {String} name    [cache name]
   * @param  {mixed} value   [cache value]
   * @param  {Object} options [cache options]
   * @return {}         []
   */
  cache: function(name, value, options){

  },
  /**
   * hook
   * @param  {[type]} event []
   * @return {[type]}       []
   */
  hook: function(event){
    
  },
  error: function(){

  }
})