/**
 * 记录日志
 * 按天写入
 * @type {Object}
 */

var fs = require('fs');
var util = require('util');

module.exports = Class(function(){
  'use strict';
  return {
    /**
     * 初始化
     * @return {[type]} [description]
     */
    init: function(){
      //创建Log目录
      mkdir(C('log_file_path'));
      //当前日期
      this.logDate = '';
      //日志文件句柄
      this.logFd = null;
    },
    /**
     * 获取文件
     * @return {[type]} [description]
     */
    getFileFd: function(){
      var date = this.getDate();
      if (date === this.logDate) {
        return getPromise(this.logFd);
      }else{
        this.logDate = date;
        var deferred = getDefer();
        var file = C('log_file_path') + '/' + this.logDate + '.log';
        var self = this;
        fs.open(file, 'w', function(err, fd){
          if (err) {
            deferred.reject(err);
          }else{
            self.logFd = fd;
            deferred.resolve(fd);
          }
        })
        return deferred.promise;
      }
    },
    get2: function(str){
      return ('0' + str).slice(-2);
    },
    /**
     * 获取当前日期
     * @return {[type]} [description]
     */
    getDate: function(){
      var d = new Date();
      return d.getFullYear() + '-' + this.get2(d.getMonth() + 1) + '-' + this.get2(d.getDate());
    },
    /**
     * 获取当前时间
     * @return {[type]} [description]
     */
    getDateTime: function(){
      var d = new Date();
      var dateTime = d.getFullYear() + '-' + this.get2(d.getMonth() + 1) + '-' + this.get2(d.getDate()) + ' ';
      dateTime += this.get2(d.getHours()) + ':' + this.get2(d.getMinutes()) + ':' + this.get2(d.getSeconds());
      return dateTime;
    },
    /**
     * 执行
     * @return {[type]} [description]
     */
    run: function(){
      var self = this;
      C('log_console_type').forEach(function(item){
        console[item] = function(){
          self.write(item.toUpperCase(), arguments);
        }
      })
    },
    /**
     * 写入日志
     * @param  {[type]} obj [description]
     * @return {[type]}     [description]
     */
    write: function(type, args){
      var dateTime = this.getDateTime();
      args = ['[' + dateTime + ']', '[' + type + ']'].concat([].slice.call(args));
      var message = util.format.apply(null, args) + '\n';
      return this.getFileFd().then(function(fd){
        fs.write(fd, message);
      })
    }
  }
});