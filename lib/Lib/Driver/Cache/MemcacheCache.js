var memcache = thinkRequire("MemcacheSocket");
module.exports = Cache(function(){
    "use strict";
    return {
        namePrefix: "__thinkjs__",
        init: function(options){
            this.super_("init", options);
            this.handle = memcache(C('memcache_port'), C('memcache_host'));
        },
        get: function(name){
            return this.handle.get(this.namePrefix + name).then(function(value){
                return value ? JSON.parse(value) : value;
            })
        },
        set: function(name, value, timeout){
            timeout = timeout || this.options.timeout;
            console.log(timeout)
            return this.handle.set(this.namePrefix + name, JSON.stringify(value), timeout);
        },
        rm: function(name){
            return this.handle.delete(this.namePrefix + name);
        }
    };
});