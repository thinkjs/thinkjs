'use strict';
/**
 * deny ip access
 * @type {}
 */
module.exports = class extends think.middleware.base {
  async run(){
    let ips = this.config('deny_ip');
    if(think.isFunction(ips)){
      ips = await think.co.wrap(ips)(this.http);
    }
    if (!ips || think.isArray(ips) && ips.length === 0) {
      return true;
    }
    let sections = this.http.ip().split('.');
    let flag = ips.some((item) => {
      return item.split('.').every((num, i) => {
        if (num === '*' || num === sections[i]) {
          return true;
        }
      });
    });
    if (flag) {
      this.http.res.statusCode = 403;
      this.http.end(); 
      //prevent next process
      return think.prevent();
    }
  }
}