'use strict';

module.exports = think.middleware({
  options: {
    //deny ip list
    deny_ip: []
  },
  run: function(){
    if (this.options.deny_ip.length === 0) {
      return true;
    }
    var clientIps = this.http.ip().split('.');
    var flag = this.options.deny_ip.some(function(item){
      return item.split('.').every(function(num, i){
        if (num === '*' || num === clientIps[i]) {
          return true;
        }
      });
    });
    if (flag) {
      this.http.res.statusCode = 403;
      this.http.res.end(); 
      return Promise.defer().promise;
    }
    return true;
  }
});
