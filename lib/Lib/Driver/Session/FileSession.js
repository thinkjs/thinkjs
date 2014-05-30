/**
 * 文件Session
 * @return {[type]} [description]
 */

var os = require("os");
module.exports = inherits("FileCache", function(){
    "use strict";
    return {
        gcType: "FileSession",
        /**
         * 差异化的init
         * @return {[type]} [description]
         */
        init: function(options){
            options = options || {};
            options.cache_path = C('session_path') || (os.tmpdir() + "/thinkjs");
            this.super_("init", options);
            this.key = options.cookie;
            this.updateExpire = true;
        },
        initData: function(){
            var self = this;
            if (!this.promise) {
                this.promise = this.getData().then(function(data){
                    self.sessionData = data || {};
                })
            }
        },
        get: function(name){
            var self = this;
            this.initData();
            return this.promise.then(function(){
                return self.sessionData[name];
            });
        },
        set: function(name, value, timeout){
            var self = this;
            this.initData();
            return this.promise.then(function(){
                self.sessionData[name] = value;
                if (timeout) {
                    self.options.timeout = timeout;
                }
            });
        },
        /**
         * 将数据写入到文件中
         * @return {[type]} [description]
         */
        flush: function(){
            return this.setData(this.sessionData);
        }
    };
});