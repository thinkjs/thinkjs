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
   * log connection
   * @return {} []
   */
  logConnect(str, type){
    //log mongodb connection infomation
    if(this.config.log_connect){
      think.log(colors => {
        return `Connect ${type} with ` + colors.magenta(str);
      }, 'SOCKET');
    }
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