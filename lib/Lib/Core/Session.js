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
var cookie_sign = function(val, secret){
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
var cookie_unsign = function(val, secret){
    var str = val.slice(0, val.lastIndexOf('.'));
    return cookie_sign(str, secret) === val ? str : false;
}

module.exports = Class(function(){
    var session_data = {};
    return {
        cookie: null,
        init: function(http){
            this.http = http;
            //session_cookie是未签名的cookie
            this.cookie = http.session_cookie; 
            if (!(this.cookie in session_data)) {
                session_data[this.cookie] = {};
            };
        },
        /**
         * 获取session，返回一个promise
         * @param  {[type]} name
         * @return {[type]}
         */
        get: function(name){
            var value = session_data[this.cookie][name] || "";
            return getPromise(value);
        },
        /**
         * 设置session
         * @param {[type]} name  [description]
         * @param {[type]} value [description]
         */
        set: function(name, value){
            if (isObject(name)) {
                for(var key in name){
                    session_data[this.cookie][key] = name[key];
                }
            }else {
                session_data[this.cookie][name] = value;
            }
        },
        /**
         * 移除session
         * @return {[type]} [description]
         */
        rm: function(name){
            if (name) {
                delete session_data[this.cookie][name];
            }else{
                session_data[this.cookie] = {};
            }
        },
        /**
         * 刷新session
         * @return {[type]} [description]
         */
        flush: function(){

        }
    }
});

//解析cookie
module.exports.start = function(http){
    if (http.session_cookie) {
        return http.session_cookie;
    };
    var name = C('session_id');
    //是否使用签名
    var secret = C('session_cookie_sign');
    var cookie = http.cookie[name];
    if (cookie && secret) {
        cookie = cookie_unsign(cookie, secret);
    };
    var session_cookie = cookie;
    if (!cookie) {
        cookie = uid(32);
        session_cookie = cookie;
        if (secret) {
            cookie = cookie_sign(cookie, secret);
        };
        http.setCookie(name, cookie, C('session_options'));
    }
    //将cookie值放到http对象上，方便后续获取
    http.session_cookie = session_cookie;

    var name = C('session_type') + "Session";
    //session类
    http.session = thinkRequire(name)(http);

    return cookie;
};

module.exports.cookie_sign = cookie_sign;
module.exports.cookie_unsign = cookie_unsign;