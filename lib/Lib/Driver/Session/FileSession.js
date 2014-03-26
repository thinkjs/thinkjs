/**
 * 文件Session
 * @return {[type]} [description]
 */

var os = require("os");
var fs = require("fs");
module.exports = Class(function(){
    return {
        init: function(http){
            this.http = http;
            //session_cookie是未签名的cookie
            this.cookie = http.session_cookie; 
            this.data = null;
            //生成存放cookie的临时目录
            var tmpDir = os.tmpdir() + "/thinkjs/";
            if (!isDir(tmpDir)) {
                mkdir(tmpDir);
            };
            //cookie文件
            this.file = tmpDir + this.cookie + ".json";
        },
        /**
         * 异步获取数据，返回一个promise
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */
        get: function(name){
            var deferrd = getDefer();
            if (this.data === null) {
                var data = getFileContent(this.file);
                data = JSON.parse(data || "{}") || {};
                this.data = data;
            };
            var self = this;
            process.nextTick(function(){
                deferrd.resolve(self.data[name]);
            })
            return deferrd.promise;
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
            this.flush();
        },
        /**
         * 删除session
         * @return {[type]} [description]
         */
        rm: function(){
            fs.unlink(this.file, function(){});
        },
        /**
         * 刷新数据，将数据写入到文件
         * @return {[type]} [description]
         */
        flush: function(){
            var data = JSON.stringify(this.data || {});
            setFileContent(this.file, data);
        }
    }
})