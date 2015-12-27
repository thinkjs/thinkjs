'use strict';
/**
 * service off
 * @type {}
 */
export default class extends think.middleware.base {
  /**
   * run
   * @return {} []
   */
  run(){
    if(!this.config('service_on')){
      let http = this.http;
      http.error = new Error(think.locale('SERVICE_UNAVAILABLE'));
      return think.statusAction(503, http);
    }
  }
}