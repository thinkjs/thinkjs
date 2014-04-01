/**
 * 文件Session
 * @return {[type]} [description]
 */

var os = require("os");
module.exports = inherits("FileCache", function(){
    "use strict";
    return {
        /**
         * gc类型
         * @type {String}
         */
        gcType: "FileSession",
        /**
         * 差异化的init
         * @return {[type]} [description]
         */
        init: function(options){
            this.super_("init", options);
            this.options.cache_path = C('session_path') || (os.tmpdir() + "/thinkjs");
            this.key = this.options.cookie;
            this.updateExpire = true;
            mkdir(this.options.cache_path);
        }
    };
});