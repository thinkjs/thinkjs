'use strict';
/**
 * force proxy
 * @type {}
 */
export default class extends think.middleware.base {
  /**
   * run
   * @return {} []
   */
  run(){
    let http = this.http;
    //deny access by ip + port
    if (this.config('proxy_on') && http.host !== http.hostname && !http.socket) {
      http.error = new Error(think.locale('DISALLOW_PORT'));
      return think.statusAction(403, http);
    }
  }
}