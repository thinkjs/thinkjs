'use strict';
/**
 * subdomain
 * @type {}
 */
export default class extends think.middleware.base {
  /**
   * run
   * @return {} []
   */
  run(){
    let subdomain = this.config('subdomain');
    if (think.isEmpty(subdomain)) {
      return;
    }
    let http = this.http;
    let hostname = http.hostname.split('.')[0];
    let value = subdomain[hostname];
    if (!value) {
      return;
    }
    http.pathname = value + '/' + http.pathname;
  }
}