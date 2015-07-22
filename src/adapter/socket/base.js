'use strict';

export default class {
  /**
   * constructor
   * @param  {} args []
   * @return {}         []
   */
  constructor(...args){
    this.init(...args);
  }
  /**
   * init
   * @return {} []
   */
  init(){
    this.connection = null;
  }
  /**
   * close socket connection
   * @return {} []
   */
  close(){
    if(this.connection){
      this.connection.close();
      this.connection = null;
    }
  }
}