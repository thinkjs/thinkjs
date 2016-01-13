'use strict';
/**
 * error controller
 */
module.exports = think.controller({
  /**
   * display error page
   * @param  {Number} status []
   * @return {Promise}        []
   */
  displayError: function(status){

    //hide error message on production env
    if(think.env === 'production'){
      this.http.error = null;
    }

    var errorConfig = this.config('error');
    var message = this.http.error && this.http.error.message || '';
    if(this.isJsonp()){
      var data = {};
      data[errorConfig.key] = status;
      data[errorConfig.msg] = message;
      return this.jsonp(data);
    }else if(this.isAjax()){
      return this.fail(status, message);
    }

    var module = 'common';
    if(think.mode !== think.mode_module){
      module = this.config('default_module');
    }
    var file = module + '/error/' + status + '.html';
    var options = this.config('tpl');
    var self = this;
    options = think.extend({}, options, {type: 'base', file_depr: '_'});
    this.fetch(file, {}, options).then(function(content){
      content = content.replace('ERROR_MESSAGE', message);
      self.type(options.content_type);
      self.end(content);
    });
  },
  /**
   * Bad Request 
   * @param  {Object} self []
   * @return {Promise} []
   */
  _400Action: function(self){
    return self.displayError(400);
  },
  /**
   * Forbidden 
   * @param  {Object} self []
   * @return {Promise} []
   */
  _403Action: function(self){
    return self.displayError(403);
  },
  /**
   * Not Found 
   * @param  {Object} self []
   * @return {Promise}      []
   */
  _404Action: function(self){
    return self.displayError(404);
  },
  /**
   * Internal Server Error
   * @param  {Object} self []
   * @return {Promise}      []
   */
  _500Action: function(self){
    return self.displayError(500);
  },
  /**
   * Service Unavailable
   * @param  {Object} self []
   * @return {Promise}      []
   */
  _503Action: function(self){
    return self.displayError(503);
  }
});