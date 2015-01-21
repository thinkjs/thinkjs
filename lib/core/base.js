'use strict';


module.exports = Class({
  /**
   * init
   * @param  {Object} http []
   * @return {}      []
   */
  init: function(http){
    this.http = http || {};
    this._init && this.init();
  },
  /**
   * get or set config
   * @param  {string} name  [config name]
   * @param  {mixed} value [config value]
   * @return {mixed}       []
   */
  config: function(name, value){
    //get all config
    if (name === undefined) {
      return think.config;
    }
    //clear all config
    if (name === null) {
      think.config = {};
      return;
    }
    if (isObject(name)) {
      extend(think.config, name);
    }else if(isString(name)){
      name = name.toLowerCase();
      //one grade config
      if (name.indexOf('.') === -1) {
        if (value === undefined) {
          return think.config[name];
        }
        think.config[name] = value;
        return;
      }
      name = name.split('.');
      if (value === undefined) {
        value = think.config[name[0]] || {};
        return value[name[1]];
      }
      if (!(name[0] in think.config)) {
        think.config[name[0]] = {};
      }
      think.config[name[0]][name[1]] = value;
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