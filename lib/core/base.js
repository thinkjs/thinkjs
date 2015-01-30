'use strict';


module.exports = Class({
  /**
   * init
   * @param  {Object} http []
   * @return {}      []
   */
  init: function(http){
    this.http = http || {};
    this._init && this._init();
  },
  /**
   * get or set config
   * @param  {string} name  [config name]
   * @param  {mixed} value [config value]
   * @return {mixed}       []
   */
  config: function(name, value){
    var http = this.http;
    //get all config
    if (name === undefined) {
      return http.config;
    }
    //clear all config
    if (name === null) {
      http.config = {};
      return;
    }
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
    var cls = think.require(model);
    return cls(this.http);
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
  event: function(event){
    
  }
})