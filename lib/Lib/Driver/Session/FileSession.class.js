/**
 * 文件Session
 * @return {[type]} [description]
 */

var os = require("os");
var fs = require("fs");
module.exports = Session(function(){
    return {
        file: "",
        data: null,
        init: function(http){
            this.super("init", http);
            this.data = null;
            //生成存放cookie的临时目录
            var tmpDir = os.tmpdir() + "/thinkjs/";
            if (!is_dir(tmpDir)) {
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
            var deferrd = when.defer();
            if (this.data === null) {
                var data = file_get_contents(this.file);
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
         * 刷新数据，将数据写入到文件，在request end的时候调用该方法
         * @return {[type]} [description]
         */
        flush: function(){
            var data = JSON.stringify(this.data || {});
            file_put_contents(this.file, data);
        }
    }
})