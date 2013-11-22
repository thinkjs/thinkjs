/**
 * 缓存类
 * @return {[type]} [description]
 */
module.exports = Class(function(){
    var caches = {};
    return {
        options: {},
        init: function(options){
            this.options = extend({
                "temp": C('data_cache_path'), //存储目录
                "prefix": C('data_cache_prefix'), //key前缀
                "expire": C('data_cache_expire') //缓存时间
            }, options);
        },
        /**
         * 获取缓存值，返回一个promise
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */
        get: function(name){
            var value = caches[name];
            if (!value) {
                return get_promise(false);
            };
            var expire = value.expire * 1000;
            var data = value.data;
            var time = value.time;
            if (Date.now() > (time + expire)) {
                delete caches[name];
                return get_promise(false);
            };
            return get_promise(data);
        },
        /**
         * 设置缓存值
         * @param {[type]} name   [description]
         * @param {[type]} value  [description]
         * @param {[type]} expire [description]
         */
        set: function(name, value, expire){
            if (expire === undefined) {
                expire = this.options.expire;
            };
            caches[name] = {
                expire: expire,
                time: Date.now(),
                data: value
            };
            return this;
        },
        /**
         * 移除缓存值
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */
        rm: function(name){
            delete caches[name];
        },
        /**
         * 清空缓存值
         * @return {[type]} [description]
         */
        clear: function(){
            caches = {};
        }
    }
});