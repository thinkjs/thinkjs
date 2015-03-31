'use strict';

var fs = require('fs');
/**
 * file cache class
 * @return {} 
 */
module.exports = think.adapter({
  /**
   * gc type
   * @type {String}
   */
  gcType: 'file_cache',
  /**
   * init
   * @param  {Object} options [options]
   * @return {}         []
   */
  init: function(options){
    this.super('init', options);
    think.mkdir(this.options.path);
    this.gcType += ':' + this.options.path;
  },
  /**
   * get store file
   * @param  {String} name []
   * @return {String}      []
   */
  getStoredFile: function(name){
    name = think.md5(name);
    var depth = this.options.path_depth || 1;
    var dir = name.slice(0, depth).split('').join('/');
    think.mkdir(this.options.path + '/' + dir);
    var filepath = this.options.path + '/' + dir + '/' + name + this.options.file_ext;
    return filepath;
  },
  __before: function(name){
    
  },
  /**
   * get cache data
   * @param  {} name []
   * @return {}      []
   */
  getData: function(name){
    var filePath = this.getStoredFile(name);
    if (!think.isFile(filePath)) {
      return Promise.resolve();
    }
    var deferred = Promise.defer();
    fs.readFile(filePath, {encoding: 'utf8'}, function(error, content){
      if (error || !content) {
        return deferred.resolve();
      }
      try{
        var data = JSON.parse(content);
        if (Date.now() > data.expire) {
          fs.unlink(filePath, function(){
            deferred.resolve();
          });
        }else{
          deferred.resolve(data.data);
        }
      }catch(e){
        fs.unlink(filePath, function(){
          deferred.resolve();
        });
      }
    });
    return deferred.promise;
  },
  /**
   * get data
   * @param  {String} name []
   * @return {}      []
   */
  get: function(name){
    return this.getData(name).then(function(data){
      return (data || {})[name];
    })
  },
  /**
   * set cache data
   * @param {String} name    [cache key]
   * @param {mixed} value   [cache value]
   * @param {Number} timeout [cache timeout]
   */
  setData: function(name, value, timeout){
    var key = name;
    if (think.isObject(name)) {
      timeout = value;
      key = Object.keys(name)[0];
    }
    if (timeout === undefined) {
      timeout = this.options.timeout;
    }
    var filePath = this.getStoredFile(key);
    var data = {
      data: think.isObject(name) ? name : think.getObject(name, value),
      expire: Date.now() + timeout * 1000,
      timeout: timeout
    };
    var deferred = Promise.defer();
    fs.writeFile(filePath, JSON.stringify(data), function(){
      //change file mod
      think.chmod(filePath);
      deferred.resolve();
    })
    return deferred.promise;
  },
  /**
   * set cache data
   * @param {String} name    [cache key]
   * @param {mixed} value   [cache value]
   * @param {Number} timeout [cache timeout]
   */
  set: function(name, value, timeout){
    return this.setData(name, value, timeout);
  },
  /**
   * remove cache
   * @param  {String} name []
   * @return {}      []
   */
  rm: function(name){
    var filePath = this.getStoredFile(name);
    if (think.isFile(filePath)) {
      var deferred = Promise.defer();
      fs.unlink(filePath, function(){
        deferred.resolve();
      })
      return deferred.promise;
    }
    return Promise.resolve();
  },
  /**
   * gc
   * @param  {Number} now [date now]
   * @return {}     []
   */
  gc: function(now, path){
    path = path || this.options.path;
    var self = this;
    var files = fs.readdirSync(path);
    files.forEach(function(item){
      var filePath = path + '/' + item;
      var stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        self.gc(now, filePath);
      }else if (stat.isFile()) {
        var data = fs.readFileSync(filePath, 'utf-8');
        try{
          data = JSON.parse(data);
          if (now > data.expire) {
            fs.unlink(filePath, function(){});
          }
        }catch(e){
          fs.unlink(filePath, function(){});
        }
      }
    });
  }
});