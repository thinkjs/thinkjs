/**
 * controller
 * @return 
 */
module.exports = Controller(function(){
  "use strict";
  return {
    indexAction: function(){
      //render View/Home/index_index.html file
      this.display();
    }
  };
});