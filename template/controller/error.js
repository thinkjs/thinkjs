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
    var file = `common/error/${status}.html`;
    var options = this.config('tpl');
    options = think.extend({}, options, {type: 'ejs'});
    return this.display(file, options);
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