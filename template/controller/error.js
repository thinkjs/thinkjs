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
  displayErrorPage: function(status){

    var errorConfig = this.config('error');
    var message = this.http.error && this.http.error.message || 'error';
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
    options = think.extend({}, options, {type: 'ejs', file_depr: '_'});
    return this.display(file, options);
  },
  /**
   * Bad Request 
   * @param  {Object} self []
   * @return {Promise} []
   */
  _400Action: function(self){
    return self.displayErrorPage(400);
  },
  /**
   * Forbidden 
   * @param  {Object} self []
   * @return {Promise} []
   */
  _403Action: function(self){
    return self.displayErrorPage(403);
  },
  /**
   * Not Found 
   * @param  {Object} self []
   * @return {Promise}      []
   */
  _404Action: function(self){
    return self.displayErrorPage(404);
  },
  /**
   * Internal Server Error
   * @param  {Object} self []
   * @return {Promise}      []
   */
  _500Action: function(self){
    return self.displayErrorPage(500);
  },
  /**
   * Service Unavailable
   * @param  {Object} self []
   * @return {Promise}      []
   */
  _503Action: function(self){
    return self.displayErrorPage(503);
  }
});