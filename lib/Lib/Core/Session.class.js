var crypto = require('crypto');

var uid = function(length){
    var ratio = Math.log(64) / Math.log(256);
    var numbytes = Math.ceil(length * ratio);
    var str = crypto.randomBytes(numbytes).toString('base64').slice(0, length);
    return str.replace(/\+/g, '_').replace(/\//g, '-');
};
var cookie_sign = function(val, secret){
    secret = crypto.createHmac('sha256', secret).update(val).digest('base64');
    secret = secret.replace(/\=+$/, '');
    return val + '.' + secret;
};
var cookie_unsign = function(val, secret){
    var str = val.slice(0, val.lastIndexOf('.'));
    return cookie_sign(str, secret) === val ? str : false;
}

module.exports = Class(function(){
    return {
        key: "",
        cookie: null,
        init: function(http){
            this.http = http;
            this.cookie = this.http.session_cookie; 
        },
        get: function(name){
            var deferrd = when.defer();
            process.nextTick(function(){
                deferrd.resolve("");
            })
            return deferrd.promise;
        },
        set: function(name, value){
            return true;
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
    if (!cookie) {
        cookie = uid(32);
        if (secret) {
            cookie = cookie_sign(cookie, secret);
        };
        http.setCookie(name, cookie, C('session_options'));
    }
    //将cookie值放到http对象上，方便后续获取
    http.session_cookie = cookie;

    var name = C('session_type') + "Session";
    var cls = think_require(name)(http);
    //session类
    http.session = cls;

    return cookie;
};

module.exports.cookie_sign = cookie_sign;
module.exports.cookie_unsign = cookie_unsign;