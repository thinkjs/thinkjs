var mime = require('mime');
var path = require('path');
/**
 * 静态资源请求
 * @return {[type]} [description]
 */
module.exports = Behavior(function(){
  'use strict';
  return {
    options: {
      'url_resource_on': false
    },
    run: function(){
      if (!global.RESOURCE_PATH || !this.options.url_resource_on || !this.http.pathname) {
        return false;
      }
      var pathname = this.http.pathname;
      if (pathname.indexOf('/') === 0) {
        pathname = pathname.substr(1);
      }
      var reg = C('url_resource_reg');
      //通过正则判断是否是静态资源请求
      if (!reg.test(pathname)) {
        return false;
      }
      pathname = path.normalize(pathname);
      var file = RESOURCE_PATH + '/' + pathname;
      var res = this.http.res;
      if (isFile(file)) {
        var contentType = mime.lookup(file);
        res.setHeader('Content-Type', contentType + '; charset=' + C('encoding'));
        tag('resource_output', this.http, file);
      }else{
        res.statusCode = 404;
        res.end();
      }
      //返回一个pendding promise, 不让后续执行
      return getDefer().promise;
    }
  };
});