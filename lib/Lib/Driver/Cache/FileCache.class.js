var fs = require("fs");
/**
 * 文件缓存
 * @return {[type]} [description]
 */
module.exports = Cache(function(){
    return {
        init: function(options){
            this.super("init", options);
            if (this.options.temp.substr(-1) !== "/") {
                this.options.temp += "/";
            };
            if (!is_dir(this.options.temp)) {
                mkdir(this.options.temp);
            };
            chmod(this.options.temp, "0777");
        },
        /**
         * 缓存的文件名
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */
        filename: function(name){
            name = md5(name);
            var filename = "";
            if (C('data_path_level')) {
                var dir = "";
                for(var i=0,length=C('data_path_level');i<length;i++){
                    dir += name[i] + "/";
                }
                if (!is_dir(this.options.temp + dir)) {
                    mkdir(this.options.temp + dir, "0777");
                };
                filename = dir + this.options.prefix + name + C('data_file_suffix');
            }else{
                filename = this.options.prefix + name + C('data_file_suffix');
            }
            return this.options.temp + filename;
        },
        /**
         * 获取缓存，返回promise
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */
        get: function(name){
            var filename = this.filename(name);
            if (!is_file(filename)) {
                return get_promise(false);
            };
            N('cache_read', 1);
            var content = file_get_contents(filename);
            if (content) {
                var expire = parseInt(content.substr(0, 20), 10) * 1000;
                var fileState = file_state(filename);
                var mtime = new Date(fileState.mtime) * 1;
                if (expire != 0 && Date.now() > (mtime + expire)) {
                    fs.unlink(filename, function(){});
                    return get_promise(false);
                };
                if(C('data_cache_check')){
                    var check = content.substr(20, 32);
                    content = content.substr(52);
                    if (check != md5(content)) {
                        fs.unlink(filename, function(){});
                        return get_promise(false);
                    };
                }else{
                    content = content.substr(20);
                }
                content = JSON.parse(content);
                return get_promise(content);
            };
            return get_promise(false);
        },
        /**
         * 设置缓存
         * @param {[type]} name   [description]
         * @param {[type]} value  [description]
         * @param {[type]} expire [description]
         */
        set: function(name, value, expire){
            N("cache_write", 1);
            if (expire === undefined) {
                expire = this.options.expire;
            };
            var filename = this.filename(name);
            var data = JSON.stringify(value);
            var check = "";
            if (C('data_cache_check')) {
                check = md5(data);
            };
            var length = (expire + "").length;
            expire = (new Array(21 - length)).join("0") + expire;
            data = expire + check + data;
            return file_put_contents(filename, data);
        },
        rm: function(name){
            var filename = this.filename(name);
            if (is_file(filename)) {
                fs.unlink(filename);
            };
        },
        clear: function(){

        }
    }
})