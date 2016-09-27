'use strict';

import { normalize } from 'path';

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
    pathname = decodeURIComponent(pathname).replace(/\\/g, '/');
    pathname = normalize(pathname);
    // replace \ to / on windows
    pathname = pathname.replace(/\\/g, '/');
    let reg = this.config('resource_reg');
    if (!reg.test(pathname)) {
      return null;
    }
    let file = normalize(`${think.RESOURCE_PATH}/${pathname}`);
    if(file.indexOf(think.RESOURCE_PATH) !== 0){
      return null;
    }
    //resource exist
    if (think.isFile(file)) {
      return file;
    }else{
      return true;
    }
  }
}