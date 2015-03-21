/**
 * cache base class
 * @return {} []
 */
module.exports = think.adapter({
  /**
   * gc的类型，用于定时器类型判断
   * @type {String}
   */
  gcType: 'Cache',
  /**
   * 初始化
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */
  init: function(options){
    options = options || {};
    this.cacheData = options.cacheData || cacheData;
    if (options.gcType) {
      this.gcType = options.gcType;
    }
    if (!options.timeout) {
      options.timeout = C('cache_timeout')
    }
    this.options = options;
    //操作的key
    this.key = '';
    //是否更新expire值
    this.updateExpire = this.options.updateExpire || false;
    think.gc(this);
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
    var data = value.data[name];
    //如果data是个对象或者数组，需要深度拷贝
    if (isObject(data)) {
      data = extend({}, data);
    }else if (isArray(data)) {
      data = extend([], data);
    }
    return getPromise(data);
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
    //如果value是个对象或者数组，这里需要深度拷贝，防止程序里修改值导致缓存值被修改
    if (isObject(value)) {
      value = extend({}, value);
    }else if (isArray(value)) {
      value = extend([], value);
    }
    if (key in this.cacheData) {
      this.cacheData[key].data[name] = value;
    }else{
      this.cacheData[key] = {
        data: getObject(name, value),
        timeout: timeout,
        expire: Date.now() + timeout * 1000
      };
    }
    return getPromise();
  },
  /**
   * 移除缓存值
   * @param  {[type]} name [description]
   * @return {[type]}      [description]
   */
  rm: function(name){
    var key = this.key || name;
    if (this.key) {
      if (key in this.cacheData) {
        delete this.cacheData[key].data[name];
      }
    }else{
      delete this.cacheData[name];
    }
    return getPromise();
  },
  /**
   * gc
   * @param  {[type]} now [description]
   * @return {[type]}     [description]
   */
  gc: function(now){
    for(var key in this.cacheData){
      var item = this.cacheData[key];
      if (item && now > item.expire) {
        delete this.cacheData[key];
      }
    }
  }
})