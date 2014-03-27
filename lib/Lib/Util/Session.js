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

/**
 * 定时器
 * @type {Number}
 */
var gcTimer = 0;
/**
 * 清除已经过期的session数据
 * @return {[type]} [description]
 */
var gc = function(instance){
    if (APP_DEBUG || APP_MODE || gcTimer) {
        return;
    };
    //超时时间
    var timeout = C('cookie_expires') || 24 * 3600 * 1000;
    //1天执行一次
    gcTimer = setInterval(function(){
        var hour = (new Date).getHours();
        //早上四点清理
        if (hour !== 4) {
            return;
        };
        var now = Date.now();
        instance.gc && instance.gc(now, timeout);
    }, 3600 * 1000);
}

/**
 * 存储session的数据变量
 * @type {Object}
 */
var session_data = {};
var Session = module.exports = Class(function(){
    return {
        cookie: null,
        init: function(http){
            this.http = http;
            //session_cookie是未签名的cookie
            this.cookie = http.session_cookie;
            gc(this);
            this.afterInit && this.afterInit();
        },
        /**
         * 差异化的init放在这里实现
         * @return {[type]} [description]
         */
        afterInit: function(){
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
            session_data[this.cookie].__ACTIVE_TIME__ = Date.now();
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
         * gc
         * @param  {[type]} now     [description]
         * @param  {[type]} timeout [description]
         * @return {[type]}         [description]
         */
        gc: function(now, timeout){
            for(var cookie in session_data){
                var time = session_data[cookie].__ACTIVE_TIME__;
                if (now - time > timeout) {
                    delete session_data[cookie];
                };
            }
        }
    }
});

//解析cookie
Session.start = function(http){
    if (http.session_cookie) {
        return http.session_cookie;
    };
    var name = C('session_id');
    //是否使用签名
    var secret = C('session_cookieSign');
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
    //将cookie值放到http对象上，方便后续获取
    http.session_cookie = session_cookie;

    var name = C('session_type') + "Session";
    //session类
    http.session = thinkRequire(name)(http);

    return cookie;
};