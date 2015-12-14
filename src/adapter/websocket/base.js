'use strict';

import url from 'url';

export default class extends think.adapter.base {
  /**
   * init
   * @param  {Object} server []
   * @param  {Object} config []
   * @return {Object}        []
   */
  init(server, config, app){
    this.server = server;
    this.config = config;
    this.app = app;
  }
  /**
   * check origin allowed
   * @param  {String}  origin []
   * @return {Boolean}        []
   */
  isOriginAllowed(origin){
    let allowOrigins = this.config.allow_origin;
    if (!allowOrigins) {
      return true;
    }
    let info = url.parse(origin);
    let hostname = info.hostname;
    if (think.isString(allowOrigins)) {
      return allowOrigins === hostname;
    }else if (think.isArray(allowOrigins)) {
      return allowOrigins.indexOf(hostname) > -1;
    }else if (think.isFunction(allowOrigins)) {
      return allowOrigins(hostname, info);
    }
    return false;
  }
  /**
   * run
   * @return {} []
   */
  run(){

  }
}