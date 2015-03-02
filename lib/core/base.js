'use strict';


module.exports = Class({
  /**
   * init
   * @param  {Object} http []
   * @return {}      []
   */
  init: function(http){
    this.http = http;
  },
  /**
   * get or set config
   * @param  {string} name  [config name]
   * @param  {mixed} value [config value]
   * @return {mixed}       []
   */
  config: function(name, value){
    var http = this.http || think;
    if (isObject(name)) {
      extend(http.config, name);
    }else if(isString(name)){
      name = name.toLowerCase();
      //one grade config
      if (name.indexOf('.') === -1) {
        if (value === undefined) {
          return http.config[name];
        }
        http.config[name] = value;
        return;
      }
      name = name.split('.');
      if (value === undefined) {
        value = http.config[name[0]] || {};
        return value[name[1]];
      }
      if (!(name[0] in http.config)) {
        http.config[name[0]] = {};
      }
      http.config[name[0]][name[1]] = value;
    }
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
   * @param  {[type]} event [description]
   * @return {[type]}       [description]
   */
  hook: function(event){
    
  },
  error: function(){

  }
})