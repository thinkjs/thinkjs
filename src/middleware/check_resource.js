'use strict';
/**
 * resource check
 * @param  {}            
 * @return {}     []
 */
export default class extends think.middleware.base {
  /**
   * run
   * @return {Promise} []
   */
  run(){
    let pathname = this.http.pathname;
    if (!this.config('resource_on') || !pathname || pathname === '/') {
      return null;
    }
    pathname = decodeURIComponent(pathname);
    let reg = this.config('resource_reg');
    if (!reg.test(pathname)) {
      return null;
    }
    let file = `${think.RESOURCE_PATH}/${pathname}`;
    //resource exist
    if (think.isFile(file)) {
      return file;
    }else{
      return true;
    }
  }
}