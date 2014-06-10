/**
 * 文件Session
 * @return {[type]} [description]
 */

var os = require("os");
module.exports = Class(function(){
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
        },
        initData: function(){
            if (!this.promise) {
                var self = this;
                this.promise = this.getData().then(function(data){
                    self.sessionData = data || {};
                })
            }
            return this.promise;
        },
        get: function(name){
            var self = this;
            return this.initData().then(function(){
                return self.sessionData[name];
            });
        },
        set: function(name, value, timeout){
            var self = this;
            return this.initData().then(function(){
                self.sessionData[name] = value;
                if (timeout) {
                    self.options.timeout = timeout;
                }
            });
        },
        rm: function(){
            this.sessionData = {};
            return getPromise();
        },
        /**
         * 将数据写入到文件中
         * @return {[type]} [description]
         */
        flush: function(){
            var self = this;
            return this.initData().then(function(){
                return self.setData(self.sessionData);
            })
        }
    };
}, thinkRequire("FileCache"));