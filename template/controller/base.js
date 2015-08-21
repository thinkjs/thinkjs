'use strict';

module.exports = think.controller({
  /**
   * index action
   * @return {Promise} []
   */
  indexAction: function(self){
    //auto render template file home/index_index.html
    self.display();
  }
});