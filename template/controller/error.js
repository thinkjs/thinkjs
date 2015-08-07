'use strict';
/**
 * error controller
 */
module.exports = think.controller({
  /**
   * [_400Action description]
   * @param  {Object} self []
   * @return {Promise}      []
   */
  _400Action: function(self){
    self.display('400.html');
  },
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
  },
  /**
   * [_503Action description]
   * @param  {Object} self []
   * @return {Promise}      []
   */
  _503Action: function(self){
    self.display('503.html');
  }
});