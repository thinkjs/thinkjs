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
  async run(){
    if (!think.RESOURCE_PATH || !this.config('resource_on') || !this.http.pathname) {
      return false;
    }
    let pathname = decodeURIComponent(this.http.pathname);
    let reg = this.config('resource_reg');
    if (!reg.test(pathname)) {
      return false;
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