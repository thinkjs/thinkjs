var redis = think.adapter('socket', 'redis');
module.exports = think.adapter({
  namePrefix: think.config('cache_key_prefix'),
  init: function(options){
    this.super_('init', options);
    if (!instance) {
      instance = redis(C('redis_port'), C('redis_host'));
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
})