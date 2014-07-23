/**
 * 记录日志
 * 按天写入
 * @type {Object}
 */

var fs = require('fs');
var util = require('util');
var os = require('os');

module.exports = Class(function(){
  'use strict';
  return {
    /**
     * 初始化
     * @return {[type]} [description]
     */
    init: function(logPath){
      //日志存放路径
      this.logPath = logPath;
      //创建日志存放目录
      mkdir(this.logPath);
    },
    /**
     * 获取文件
     * @return {[type]} [description]
     */
    getLogFile: function(){
      var date = this.getDate();
      var file = this.logPath + '/' + date + '.log';
      return file;
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
     * 记录console的日志
     * @return {[type]} [description]
     */
    console: function(){
      var self = this;
      C('log_console_type').forEach(function(item){
        console[item] = function(){
          var msgs = ['[' + item.toUpperCase() + ']'].concat([].slice.call(arguments));
          self.write(msgs);
        }
      })
    },
    /**
     * 记录内存使用
     * @return {[type]} [description]
     */
    memory: function(){
      var format = function(data){
        return (data / 1048576).toFixed(1) + 'MB'; // 1048576 = 1024 * 1024
      }
      var self = this;
      setInterval(function(){
        var memoryUsage = process.memoryUsage();
        var loadAvg = os.loadavg();
        var msgs = [
          'rss:' + format(memoryUsage.rss),
          'heapTotal:' + format(memoryUsage.heapTotal),
          'heapUsed:' + format(memoryUsage.heapUsed),
          'freeMemory:' + format(os.freemem()),
          'loadAvg:' + loadAvg[0].toFixed(1) + ',' + loadAvg[1].toFixed(1) + ',' + loadAvg[2].toFixed(2)
        ];
        self.write(msgs);
      }, C('log_memory_interval'))
    },
    /**
     * 写入日志
     * @param  {[type]} obj [description]
     * @return {[type]}     [description]
     */
    write: function(msgs){
      var dateTime = this.getDateTime();
      msgs = ['[' + dateTime + ']'].concat([].slice.call(msgs));
      var message = util.format.apply(null, msgs) + '\n';
      fs.appendFile(this.getLogFile(), message);
    }
  }
});