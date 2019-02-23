'use strict';

/**
 * socket base class
 */
export default class extends think.adapter.base {
  /**
   * init
   * @return {} []
   */
  init(){
    this.connection = null;
    //query queue nums
    this.queueNums = 0;
    //auto close socket timer
    this.closeTimer = 0;
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
   * auto close socket on cli mode
   * @return {Promise} []
   */
  autoClose(promise){
    if(!think.config('auto_close_socket')){
      return promise;
    }

    let close = () => {
      this.queueNums--;
      if(this.queueNums === 0){
        this.closeTimer = setTimeout(() => {
          this.close();
        }, 3000);
      }
    };

    clearTimeout(this.closeTimer);

    this.queueNums++;
    return promise.then(data => {
      close();
      return data;
    }).catch(err => {
      close();
      return Promise.reject(err);
    });
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

  /**
   * get instance
   * @param  {Object} config []
   * @return {Object}        []
   */
  static getInstance(config, type, extraKeys = []){
    config = think.parseConfig(config);

    //delete extra keys when caculate config md5 value
    extraKeys.forEach(item => delete config[item]);
    let key = think.md5(JSON.stringify(config)).slice(0, 5);

    let instance = thinkCache(type, key);
    if(!instance){
      instance = new this(config);
      thinkCache(type, key, instance);
    }
    return instance;
  }
}