'use strict';

var mime = require('mime');

/**
 * resource check
 * @param  {}            
 * @return {}     []
 */
module.exports = think.middleware({
  options: {
    resource_on: false,
    resource_reg: undefined
  },
  run: function(){
    if (!think.RESOURCE_PATH || !this.options.resource_on || !this.http.pathname) {
      return false;
    }
    var pathname = this.http.pathname;
    var reg = this.options.resource_reg;
    if (!reg.test(pathname)) {
      return false;
    }
    var file = think.RESOURCE_PATH + '/' + pathname;
    var res = this.http.res;
    //resource exist
    if (think.isFile(file)) {
      var contentType = mime.lookup(file);
      res.setHeader('Content-Type', contentType + '; charset=' + this.config('encoding'));
      this.hook('resource_output', file);
    }else{
      if (pathname.indexOf('/') === -1) {
        return false;
      }
      res.statusCode = 404;
      res.end();
    }
    return think.defer().promise;
  }
});