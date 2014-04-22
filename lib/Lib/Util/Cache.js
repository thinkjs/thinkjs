/**
 * 缓存基类
 * @return {[type]} [description]
 */
/**
 * 缓存数据
 * @type {Object}
 */
var cacheData = {};
/**
 * 定时器
 * @type {Number}
 */
var gcTimer = {};
/**
 * 清除已经过期的Cache
 * @return {[type]} [description]
 */
var gc = function(instance){
    "use strict";
    if (APP_DEBUG || APP_MODE || gcTimer[instance.gcType]) {
        return;
    }
    gcTimer[instance.gcType] = setInterval(function(){
        var hour = (new Date()).getHours();
        if (C('cache_gc_hour').indexOf(hour) === -1) {
            return;
        }
        var now = Date.now();
        if (instance.gc) {
            console.log("gc clean");
            instance.gc(now);
        }
    }, 3600 * 1000);
};

module.exports = Class(function(){
    "use strict";
    return {
        /**
         * gc的类型，用于定时器类型判断
         * @type {String}
         */
        gcType: "Cache",
        /**
         * 初始化
         * @param  {[type]} options [description]
         * @return {[type]}         [description]
         */
        init: function(options){
            this.options = extend({
                timeout: C('cache_timeout')
            }, options || {});
            //操作的key
            this.key = "";
            //是否更新expire值
            this.updateExpire = false;
            //cache分组的功能，用于删除一个分组下的cache
            var group = options.group || "_default";
            if (!(group in cacheData)) {
                cacheData[group] = {};
            };
            //缓存数据
            this.cacheData = cacheData[group];
            gc(this);
        },
        /**
         * 获取缓存值，返回一个promise
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */
        get: function(name){
            var key = this.key || name;
            if (!(key in this.cacheData)) {
                return getPromise();
            }
            var value = this.cacheData[key];
            if (Date.now() > value.expire) {
                delete this.cacheData[key];
                return getPromise();
            }
            if (this.updateExpire) {
                this.cacheData[key].expire = Date.now() + value.timeout * 1000;
            }
            return getPromise(value.data[name]);
        },
        /**
         * 设置缓存值
         * @param {[type]} name   [description]
         * @param {[type]} value  [description]
         */
        set: function(name, value, timeout){
            if (timeout === undefined) {
                timeout = this.options.timeout;
            }
            var key = this.key || name;
            if (key in this.cacheData) {
                this.cacheData[key].data[name] = value;
            }else{
                this.cacheData[key] = {
                    data: getObject(name, value),
                    timeout: timeout,
                    expire: Date.now() + timeout * 1000
                };
            }
        },
        /**
         * 移除缓存值
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */
        rm: function(name){
            var key = this.key || name;
            if (key in this.cacheData) {
                delete this.cacheData[key].data[name];
            }
        },
        /**
         * gc
         * @param  {[type]} now [description]
         * @return {[type]}     [description]
         */
        gc: function(now){
            for(var group in cacheData){
                for(var key in cacheData[group]){
                    var item = cacheData[group][key] || {};
                    if (now > item.expire) {
                        delete cacheData[group][key];
                    }
                }
            }
        }
    };
});
/**
 * 获取缓存数据
 * @param  {[type]} name [description]
 * @return {[type]}      [description]
 */
module.exports.getCache = function(group){
    return group ? cacheData[group] : cacheData;
}
/**
 * 删除分组的缓存
 * @param  {[type]} group [description]
 * @return {[type]}       [description]
 */
module.exports.deleteCache = function(group){
    if(group){
        delete cacheData[group];
    }else{
        cacheData = {};
    }
}