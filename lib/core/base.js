'use strict';


module.exports = Class({
  /**
   * init
   * @param  {Object} http []
   * @return {}      []
   */
  init: function(http){
    this.http = http;
    this._init && this.init();
  },
  config: function(name, value){

  },
  model: function(model){

  },
  cache: function(name, value, options){

  },
  event: function(event){
    
  }
})