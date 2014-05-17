var fs = require("fs");
/**
 * 基于文件的缓存
 * @return {[type]} [description]
 */
module.exports = Cache(function(){
    "use strict";
    return {
        gcType: "FileCache",
        init: function(options){
            this.options = extend({
                cache_path: C('cache_path'), //缓存目录
                cache_path_level: 2, //缓存子目录深度
                cache_file_suffix: C('cache_file_suffix') //缓存文件后缀名
            }, options);
            mkdir(this.options.cache_path);
            this.gcType += ":" + this.options.cache_path;

            this.super_("init", this.options);
        },
        /**
         * 存储的缓存文件
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */
        getStoredFile: function(name){
            name = md5(this.key || name);
            var dir = name.split("").slice(0, this.options.cache_path_level).join("/");
            mkdir(this.options.cache_path + "/" + dir);
            var path = this.options.cache_path + "/" + dir + "/" + name + this.options.cache_file_suffix;
            return path;
        },
        /**
         * 获取缓存，返回promise
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */
        get: function(name){
            var filePath = this.getStoredFile(name);
            if (!isFile(filePath)) {
                return getPromise();
            }
            var deferred = getDefer();
            var self = this;
            fs.exists(filePath, function(exists){
                if (!exists) {
                    return deferred.resolve();
                }
                fs.readFile(filePath, function(error, content){
                    if (error || !content) {
                        return deferred.resolve();
                    }
                    var data = JSON.parse(content);
                    if (Date.now() > data.expire) {
                        fs.unlink(filePath, function(){});
                        return deferred.resolve();
                    }
                    //更新expire时间
                    if (self.updateExpire) {
                        data.expire = Date.now() + data.timeout * 1000;
                        fs.writeFile(filePath, JSON.stringify(data), function(){});
                    }
                    deferred.resolve(data.data[name]);
                });
            });
            return deferred.promise;
        },
        /**
         * 设置缓存
         * @param {[type]} name   [description]
         * @param {[type]} value  [description]
         * @param {[type]} expire [description]
         */
        set: function(name, value, timeout){
            if (timeout === undefined) {
                timeout = this.options.timeout;
            }
            var filePath = this.getStoredFile(name);
            var data = {
                data: getObject(name, value),
                expire: Date.now() + timeout * 1000,
                timeout: timeout
            };
            setFileContent(filePath, JSON.stringify(data));
            return getPromise();
        },
        /**
         * 删除缓存
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */
        rm: function(name){
            var filePath = this.getStoredFile(name);
            if (isFile(filePath)) {
                fs.unlink(filePath, function(){});
            }
        },
        /**
         * gc
         * @param  {[type]} now [description]
         * @return {[type]}     [description]
         */
        gc: function(now, path){
            path = path || this.options.cache_path;
            var self = this;
            var files = fs.readdirSync(path);
            files.forEach(function(item){
                var filePath = path + "/" + item;
                var stat = fs.statSync(filePath);
                if (stat.isDirectory()) {
                    self.gc(now, filePath);
                }else if (stat.isFile()) {
                    var data = getFileContent(filePath);
                    try{
                        data = JSON.parse(data);
                        if (now > data.expire) {
                            fs.unlink(filePath, function(){});
                        }
                    }catch(e){}
                }
            });
        }
    };
});