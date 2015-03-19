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

  },
  /**
   * get module name
   * @param  {String} module [module name]
   * @return {String}        []
   */
  getModule: function(module){
    return module || this.config('default_module');
  },
  /**
   * get controller name
   * @param  {String} controller [controller name]
   * @return {String}            []
   */
  getController: function(controller){
    return controller || this.config('default_controller');
  },
  /**
   * get action name
   * @param  {String} action [action name]
   * @return {String}        []
   */
  getAction: function(action){
    return (action || this.config('default_action')) + this.config('action_suffix');
  }
})