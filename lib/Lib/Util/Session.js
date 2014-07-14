var crypto = require('crypto');
/**
 * 生成uid
 * @param  int length
 * @return string
 */
var uid = function(length){
  'use strict';
  var ratio = Math.log(64) / Math.log(256);
  var numbytes = Math.ceil(length * ratio);
  var str = crypto.randomBytes(numbytes).toString('base64').slice(0, length);
  return str.replace(/\+/g, '_').replace(/\//g, '-');
};
/**
 * 生成cookie签名
 * @param  string val
 * @param  string secret
 * @return string
 */
var cookieSign = function(val, secret){
  'use strict';
  secret = crypto.createHmac('sha256', secret).update(val).digest('base64');
  secret = secret.replace(/\=+$/, '');
  return val + '.' + secret;
};
/**
 * 解析cookie签名
 * @param  {[type]} val
 * @param  {[type]} secret
 * @return {[type]}
 */
var cookieUnsign = function(val, secret){
  'use strict';
  var str = val.slice(0, val.lastIndexOf('.'));
  return cookieSign(str, secret) === val ? str : '';
};

var Session = module.exports = Cache(function(){
  'use strict';
  return {
    init: function(options){
      this.super_('init', options);
      this.key = this.options.cookie;
      this.updateExpire = true;
    }
  };
});

Session.start = function(http){
  'use strict';
  if (http.session) {
    return http.session;
  }
  var name = C('session_name');
  //是否使用签名
  var secret = C('session_sign');
  var cookie = http.cookie[name];
  if (cookie && secret) {
    cookie = cookieUnsign(cookie, secret);
    if (cookie) {
      http.cookie[name] = cookie;
    }
  }
  var session_cookie = cookie;
  if (!cookie) {
    cookie = uid(32);
    session_cookie = cookie;
    if (secret) {
      cookie = cookieSign(cookie, secret);
    }
    //将生成的cookie放在http.cookie对象上，方便程序内读取
    http.cookie[name] = cookie;
    http.setCookie(name, cookie, C('session_options'));
  }
  var type = C('session_type');
  if (!type) {
    if (APP_DEBUG) {
      type = 'File';
      console.log("in debug mode, session can't use memory type for storage, convert to File type");
    }else if (C('use_cluster')) {
      type = 'File';
      console.log("in cluster mode, session can't use memory type for storage, convert to File type");
    }
  }
  name = type + 'Session';
  //session类
  var session = http.session = thinkRequire(name)({
    cookie: session_cookie,
    timeout: C('session_timeout')
  });
  //afterend时刷新缓存
  http.on('afterEnd', function(){
    //刷新session
    return session.flush && session.flush();
  })
  return cookie;
};