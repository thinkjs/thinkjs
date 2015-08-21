'use strict';

export default class think.controller.base {
  /**
   * index action
   * @return {Promise} []
   */
  indexAction(){
    //auto render template file home/index_index.html
    this.display();
  }
}