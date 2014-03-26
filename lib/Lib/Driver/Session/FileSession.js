/**
 * 文件Session
 * @return {[type]} [description]
 */

var os = require("os");
var fs = require("fs");

//生成存放cookie的临时目录
var sessionTmpDir = os.tmpdir() + "/thinkjs";
if (!isDir(sessionTmpDir)) {
    mkdir(sessionTmpDir);
};

/**
 * 定时器
 * @type {Number}
 */
var clearTimer = 0;
/**
 * 清除已经过期的session数据
 * @return {[type]} [description]
 */
var clearTimeoutSessionData = function(){
    if (APP_DEBUG || APP_MODE || clearTimer) {
        return;
    };
    var timeout = C('session_timeout');
    //1天执行一次
    clearTimer = setInterval(function(){
        var hour = (new Date).getHours();
        //早上四点清理
        if (hour !== 4) {
            return;
        };
        var now = Date.now();
        fs.readdir(sessionTmpDir, function(err, files){
            files.forEach(function(file){
                file = sessionTmpDir + '/' + file;
                var mtime = fs.statSync(file).mtime;
                var time = (new Date(mtime)).getTime();
                if (now - time > timeout) {
                    fs.unlink(file, function(){});
                };
            })
        })
    }, 3600 * 1000);
}

module.exports = Class(function(){
    return {
        init: function(http){
            this.http = http;
            //session_cookie是未签名的cookie
            this.cookie = http.session_cookie; 
            this.data = null;
            //cookie文件
            this.file = sessionTmpDir + "/" + this.cookie + ".json";
            clearTimeoutSessionData();
        },
        /**
         * 异步获取数据，返回一个promise
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */
        get: function(name){
            if (this.data) {
                return getPromise(this.data[name]);
            };
            var deferred = getDefer();
            var self = this;
            fs.exists(this.file, function(exists){
                self.data = {};
                if (!exists) {
                    return deferred.resolve("");
                };
                fs.readFile(self.file, function(err, data){
                    if (err) {
                        return deferred.resolve("");
                    };
                    data = JSON.parse(data);
                    self.data = data;
                    deferred.resolve(data[name]);
                })
            })
            return deferred.promise;
        },
        /**
         * 设置session
         * @param {[type]} name  [description]
         * @param {[type]} value [description]
         */
        set: function(name, value){
            if (this.data === null) {
                this.data = {};
            };
            this.data[name] = value;
            var data = JSON.stringify(this.data || {});
            fs.writeFile(this.file, data, function(){});
        },
        /**
         * 删除session
         * @return {[type]} [description]
         */
        rm: function(){
            this.data = {};
            fs.unlink(this.file, function(){});
        }
    }
})