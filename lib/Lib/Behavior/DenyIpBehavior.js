/**
 * 阻止ip来源访问
 * @return {[type]} [description]
 */
module.exports = Behavior(function(){
  'use strict';
  return {
    options: {
      deny_ip: [] //阻止的ip列表
    },
    run: function(){
      var deny_ip = this.options.deny_ip;
      if (isArray(deny_ip) && deny_ip.length === 0) {
        return true;
      }
      var clientIps = this.http.ip().split('.');
      var promise = getPromise(deny_ip);
      if (isFunction(deny_ip)) {
        promise = getPromise(deny_ip());
      }
      var self = this;
      return promise.then(function(deny_ip){
        if (!deny_ip || deny_ip.length === 0) {
          return true;
        }
        var flag = deny_ip.some(function(item){
          return item.split('.').every(function(num, i){
            if (num === '*' || num === clientIps[i]) {
              return true;
            }
          });
        });
        //如果在阻止的ip在列表里，则返回一个pendding promise，让后面的代码不执行
        if (flag) {
          self.http.res.statusCode = 403;
          self.http.res.end(); 
          return getDefer().promise;
        }
        return true;
      })
    }
  };
});