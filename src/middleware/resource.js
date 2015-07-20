'use strict';

import mime from 'mime';

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
    let pathname = this.http.pathname;
    let reg = this.config('resource_reg');
    if (!reg.test(pathname)) {
      return false;
    }
    let file = `${think.RESOURCE_PATH}/${pathname}`;
    //resource exist
    if (think.isFile(file)) {
      let contentType = mime.lookup(file);
      this.http.header('Content-Type', `${contentType}; charset=${this.config('encoding')}`);
      await this.hook('resource_output', file);
    }else{
      this.http.status(404);
      this.http.end();
    }
    return think.prevent();
  }
}