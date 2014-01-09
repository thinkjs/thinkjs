/**
 * 缓存类
 * @return {[type]} [description]
 */
module.exports = Class(function(){
    var caches = {};
    return {
        options: {},
        init: function(options){
            options = isObject(options) ? options : {};
            this.options = extend({
                "temp": C('data_cache_path'), //存储目录
                "prefix": C('data_cache_prefix'), //key前缀
                "expire": C('data_cache_time') //缓存时间
            }, options);
        },
        /**
         * 获取缓存值，返回一个promise
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */
        get: function(name){
            if (!(name in caches)) {
                return getPromise();
            };
            var value = caches[name];
            var data = value.data;
            var expire = value.expire * 1000;
            //永久缓存
            if (expire === 0) {
                return getPromise(data);
            };
            var time = value.time;
            if (Date.now() > (time + expire)) {
                delete caches[name];
                return getPromise();
            };
            // var isArr = false;
            // if ((isArr = isArray(data)) || isObject) {
            //     data = extend(isArr ? [] : {}, data);
            // };
            return getPromise(data);
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