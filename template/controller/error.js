'use strict';
/**
 * error controller
 */
module.exports = think.controller({
  /**
   * forbidden action
   * @return {Promise} []
   */
  _403Action: function(self){
    self.display('403.html');
  },
  /**
   * not found action
   * @param  {Object} self []
   * @return {Promise}      []
   */
  _404Action: function(self){
    self.display('404.html');
  },
  /**
   * system error action
   * @param  {Object} self []
   * @return {Promise}      []
   */
  _500Action: function(self){
    self.display('500.html');
  }
});