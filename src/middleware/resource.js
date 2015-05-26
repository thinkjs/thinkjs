'use strict';

let mime = require('mime');

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
    let res = this.http.res;
    //resource exist
    if (think.isFile(file)) {
      let contentType = mime.lookup(file);
      res.setHeader('Content-Type', `${contentType}; charset=${this.config('encoding')}`);
      await this.hook('resource_output', file);
    }else{
      if (pathname.indexOf('/') === -1) {
        return false;
      }
      res.statusCode = 404;
      this.http.end();
    }
    return think.prevent();
  }
}