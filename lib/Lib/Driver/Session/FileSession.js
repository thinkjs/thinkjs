/**
 * 文件Session
 * @return {[type]} [description]
 */

var os = require("os");
var fs = require("fs");

//生成存放cookie的临时目录
var sessionTmpDir = os.tmpdir() + "/thinkjs";
mkdir(sessionTmpDir);

module.exports = Session(function(){
    return {
        /**
         * 差异化的init
         * @return {[type]} [description]
         */
        afterInit: function(){
            this.data = null;
            //cookie文件
            this.file = sessionTmpDir + "/" + this.cookie + ".json";
        },
        /**
         * 异步获取数据，返回一个promise
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */
        get: function(name){
            if (this.data) {
                return getPromise(this.data[name] || "");
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
            fs.writeFile(this.file, JSON.stringify(this.data), function(){});
        },
        /**
         * 删除session
         * @return {[type]} [description]
         */
        rm: function(){
            this.data = {};
            fs.unlink(this.file, function(){});
        },
        /**
         * gc
         * @param  {[type]} now     [description]
         * @param  {[type]} timeout [description]
         * @return {[type]}         [description]
         */
        gc: function(now, timeout){
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
        }
    }
})