'use strict';

module.exports = think.controller({
  /**
   * index action
   * @return {Promise} []
   */
  indexAction: function(self){
    //auto render template
    self.display();
  }
});