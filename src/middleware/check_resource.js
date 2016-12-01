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
    // pathname maybe not valid, then throw an `URI malformed` error
    try{
      pathname = decodeURIComponent(pathname).replace(/\\/g, '/');
    }catch(e){
      return null;
    }
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
      let cors = this.config('resource_cors');
      if(cors){
        this.http.header('Access-Control-Allow-Origin', typeof cors === 'string' ? cors : '*');
      }
      return file;
    }else{
      return true;
    }
  }
}