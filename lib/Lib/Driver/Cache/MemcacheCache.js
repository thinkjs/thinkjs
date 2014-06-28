var memcache = thinkRequire('MemcacheSocket');
module.exports = Cache(function(){
  'use strict';
  var instance = null;
  return {
    namePrefix: '__thinkjs__',
    init: function(options){
      this.super_('init', options);
      if (!instance) {
        instance = memcache(C('memcache_port'), C('memcache_host'));
      }
      this.handle = instance;
    },
    get: function(name){
      return this.handle.get(this.namePrefix + name).then(function(value){
        return value ? JSON.parse(value) : value;
      })
    },
    set: function(name, value, timeout){
      timeout = timeout || this.options.timeout;
      return this.handle.set(this.namePrefix + name, JSON.stringify(value), timeout);
    },
    rm: function(name){
      return this.handle.delete(this.namePrefix + name);
    }
  };
});