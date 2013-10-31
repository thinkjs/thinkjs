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
                "temp": C('data_cache_path'),
                "prefix": C('data_cache_prefix'),
                "expire": C('data_cache_expire'),
                "length": 0
            }, options);
        },
        get: function(name){
            var value = caches[name];
            if (!value) {
                return false;
            };
            var expire = value.expire * 1000;
            var data = value.data;
            var time = value.time;
            if (Date.now() > (time + expire)) {
                delete caches[name];
                return false;
            };
            return data;
        },
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
        rm: function(name){
            delete caches[name];
        },
        clear: function(){
            caches = {};
        }
    }
});