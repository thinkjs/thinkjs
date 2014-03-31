var crypto = require('crypto');
/**
 * 生成uid
 * @param  int length
 * @return string
 */
var uid = function(length){
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
    var str = val.slice(0, val.lastIndexOf('.'));
    return cookieSign(str, secret) === val ? str : false;
}

var Session = module.exports = Cache(function(){
    return {
        init: function(options){
            this.super_("init", options);
            this.key = this.options.cookie;
        }
    }
});

//解析cookie
Session.start = function(http){
    if (http.session) {
        return http.session;
    };
    var name = C('session_name');
    //是否使用签名
    var secret = C('session_sign');
    var cookie = http.cookie[name];
    if (cookie && secret) {
        cookie = cookieUnsign(cookie, secret);
    };
    var session_cookie = cookie;
    if (!cookie) {
        cookie = uid(32);
        session_cookie = cookie;
        if (secret) {
            cookie = cookieSign(cookie, secret);
        };
        http.setCookie(name, cookie, C('session_options'));
    }
    var name = C('session_type') + "Session";
    //session类
    http.session = thinkRequire(name)({
        cookie: session_cookie,
        timeout: C('session_timeout')
    });
    return cookie;
};