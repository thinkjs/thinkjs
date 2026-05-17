'use strict';
/**
 * ip filter, support blacklist & whitelist
 */
export default class extends think.middleware.base {
  /**
   * check ip is white
   * @return {Boolean} []
   */
  checkIp(ip, ipList){
    if(!think.isArray(ipList)){
      ipList = [ipList];
    }
    let ips = ip.split('.');
    let flag = ipList.some(item => {
      if(think.isRegExp(item)){
        return item.test(ip);
      }
      return item.split('.').every((num, i) => {
        if (num === '*' || num === ips[i]) {
          return true;
        }
      });
    });
    return flag;
  }
  /**
   * show error
   * @return {Promise} []
   */
  showError(){
    this.http.error = new Error('ip is not allowed');
    return think.statusAction(403, this.http);
  }
  /**
   * run
   * @return {Promise} []
   */
  async run(){

    let config = this.config('ip_filter');
    if(!config){
      return;
    }

    //get config by dynamic
    if(think.isFunction(config)){
      config = await think.co.wrap(config)(this.http) || [];
    }

    //only blackList
    if(think.isArray(config)){
      config = {blackList: config};
    }

    let ip = this.http.ip();
    if(!think.isEmpty(config.whiteList)){
      let flag = this.checkIp(ip, config.whiteList);
      if(!flag){
        return this.showError();
      }
      return;
    }
    
    if(!think.isEmpty(config.blackList)){
      let flag = this.checkIp(ip, config.blackList);
      if(flag){
        return this.showError();
      }
    }
  }
}