var fs = require('fs');
var mime = require('mime');
var path = require('path');

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
    if (fs.existsSync(file)) {
      var contentType = mime.lookup(file);
      res.setHeader('Content-Type', contentType + '; charset=' + C('encoding'));
      this.hook('resource_output', file);
    }else{
      res.statusCode = 404;
      res.end();
    }
    return Promise.defer().promise;
  }
});