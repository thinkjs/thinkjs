var fs = require('fs');
/**
 * 基于文件的缓存
 * @return {[type]} [description]
 */
module.exports = Cache(function(){
  'use strict';
  return {
    gcType: 'FileCache',
    init: function(options){
      this.options = extend({
        cache_path: C('cache_path'), //缓存目录
        cache_path_level: 2, //缓存子目录深度
        cache_file_suffix: C('cache_file_suffix') //缓存文件后缀名
      }, options);
      mkdir(this.options.cache_path);
      this.gcType += ':' + this.options.cache_path;

      this.super_('init', this.options);
    },
    /**
     * 存储的缓存文件
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    getStoredFile: function(name){
      name = md5(this.key || name);
      var dir = name.split('').slice(0, this.options.cache_path_level).join('/');
      mkdir(this.options.cache_path + '/' + dir);
      var path = this.options.cache_path + '/' + dir + '/' + name + this.options.cache_file_suffix;
      return path;
    },
    /**
     * 获取缓存，返回promise
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    getData: function(name){
      var filePath = this.getStoredFile(name);
      if (!isFile(filePath)) {
        return getPromise();
      }
      var deferred = getDefer();
      fs.readFile(filePath, {encoding: 'utf8'}, function(error, content){
        if (error || !content) {
          return deferred.resolve();
        }
        try{
          var data = JSON.parse(content);
          if (Date.now() > data.expire) {
            fs.unlink(filePath, function(){
              return deferred.resolve();
            });
          }else{
            deferred.resolve(data.data);
          }
        }catch(e){
          //异常时删除该文件
          fs.unlink(filePath, function(){
            return deferred.resolve();
          });
        }
      });
      return deferred.promise;
    },
    /**
     * 获取缓存
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    get: function(name){
      return this.getData(name).then(function(data){
        return (data || {})[name];
      })
    },
    /**
     * 设置缓存值
     * @param {[type]} name    [description]
     * @param {[type]} value   [description]
     * @param {[type]} timeout [description]
     */
    setData: function(name, value, timeout){
      var key = name;
      if (isObject(name)) {
        timeout = value;
        key = Object.keys(name)[0];
      }
      if (timeout === undefined) {
        timeout = this.options.timeout;
      }
      var filePath = this.getStoredFile(key);
      var data = {
        data: isObject(name) ? name : getObject(name, value),
        expire: Date.now() + timeout * 1000,
        timeout: timeout
      };
      var deferred = getDefer();
      fs.writeFile(filePath, JSON.stringify(data), function(){
        //修改缓存文件权限，避免不同账号下启动时可能会出现无权限的问题
        chmod(filePath);
        deferred.resolve();
      })
      return deferred.promise;
    },
    /**
     * 设置缓存
     * @param {[type]} name   [description]
     * @param {[type]} value  [description]
     * @param {[type]} expire [description]
     */
    set: function(name, value, timeout){
      return this.setData(name, value, timeout);
    },
    /**
     * 删除缓存
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    rm: function(name){
      var filePath = this.getStoredFile(name);
      if (isFile(filePath)) {
        var deferred = getDefer();
        fs.unlink(filePath, function(){
          deferred.resolve();
        })
        return deferred.promise;
      }
      return getPromise();
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
        var filePath = path + '/' + item;
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