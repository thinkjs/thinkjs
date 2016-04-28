'use strict';
/**
 * rewrite pathname
 * @type {}
 */
export default class extends think.middleware.base {
  /**
   * run
   * @return {} []
   */
  run(){
    let http = this.http;
    let pathname = http.pathname;
    if (!pathname || pathname === '/') {
      return;
    }
    let prefix = http.config('pathname_prefix');
    if (prefix && pathname.indexOf(prefix) === 0) {
      pathname = pathname.substr(prefix.length);
    }
    let suffix = http.config('pathname_suffix');
    if (suffix && pathname.substr(0 - suffix.length) === suffix) {
      pathname = pathname.substr(0, pathname.length - suffix.length);
    }
    http.pathname = pathname;
  }
}