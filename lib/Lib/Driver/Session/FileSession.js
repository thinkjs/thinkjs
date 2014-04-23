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
            this.key = options.cookie;
            this.updateExpire = true;
            this.super_("init", options);
        }
    };
});