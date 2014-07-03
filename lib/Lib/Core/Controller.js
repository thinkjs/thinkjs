/**
 * Controller 基类
 * @return {[type]} [description]
 */
var fs = require('fs');
var path = require('path');
var url = require('url');

module.exports = Class(function() {
  'use strict';
  //callback正则
  var callbackReg = /[^\w\.]/g;

  return {
    /**
     * 初始化执行方法
     * @param  {[type]} http [description]
     * @return {[type]}      [description]
     */
    init: function(http) {
      this.http = http;
      this.view = null;
      //将http数据打到模版里
      this.assign('http', this.http);
      //将配置信息打到模版里
      this.assign('config', C());
      //设置变量别名
      this.set = this.assign;
    },
    /**
     * 获取客户端的ip
     * @return {[type]} [description]
     */
    ip: function() {
      return this.http.ip();
    },
    /**
     * 实例化View类
     * @return {[type]} [description]
     */
    initView: function() {
      if (!this.view) {
        this.view = thinkRequire('View')(this.http);
      }
      return this.view;
    },
    /**
     * 是否是GET请求
     * @return {Boolean} [description]
     */
    isGet: function() {
      return this.http.method === 'GET';
    },
    /**
     * 是否是POST请求
     * @return {Boolean} [description]
     */
    isPost: function() {
      return this.http.method === 'POST';
    },
    /**
     * 是否是特定METHOD请求
     * @param  {[type]}  method [description]
     * @return {Boolean}        [description]
     */
    isMethod: function(method) {
      return this.http.method === method.toUpperCase();
    },
    /**
     * 是否是AJAX请求
     * @return {Boolean} [description]
     */
    isAjax: function(method) {
      //请求类型判断
      if (method && this.http.method !== method) {
        return false;
      }
      return this.header('x-requested-with') === 'XMLHttpRequest';
    },
    /**
     * 是否是websocket请求
     * @return {Boolean} [description]
     */
    isWebSocket: function(){
      return !!this.http.websocket;
    },
    /**
     * 是否是命令行模式
     * @return {Boolean} [description]
     */
    isCli: function(){
      return APP_MODE === 'cli';
    },
    /**
     * 是否是jsonp接口
     * @return {Boolean} [description]
     */
    isJsonp: function(name){
      name = name || C('url_callback_name');
      return !!this.get(name);
    },
    /**
     * 获取QUERY参数
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    get: function(name) {
      if (name === undefined) {
        return this.http.get;
      }
      return this.http.get[name] || '';
    },
    /**
     * 获取POST参数
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    post: function(name) {
      var http = this.http;
      return name ? (http.post[name] || '') : http.post;
    },
    /**
     * 获取参数
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    param: function(name) {
      return this.post(name) || this.get(name);
    },
    /**
     * 获取上传的文件
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    file: function(name) {
      var http = this.http;
      return name ? (http.file[name] || '') : http.file;
    },
    /**
     * header操作
     * @param  {[type]} name  [description]
     * @param  {[type]} value [description]
     * @return {[type]}       [description]
     */
    header: function(name, value) {
      if (name === undefined) {
        return this.http.headers;
      }else if (isObject(name)) {
        for (var key in name) {
          this.header(key, name[key]);
        }
        return this;
      }else if (value !== undefined) {
        this.http.setHeader(name, value);
        return this;
      }else{
        return this.http.getHeader(name);
      }
    },
    /**
     * 获取userAgent
     * @return {[type]} [description]
     */
    userAgent: function(){
      return this.http.headers['user-agent'] || '';
    },
    /**
     * 获取referrer
     * @return {[type]} [description]
     */
    referer: function(host){
      var referer = this.http.headers.referer || this.http.headers.referfer || '';
      if (!referer || !host) {
        return referer;
      }
      var info = url.parse(referer);
      return info.hostname;
    },
    /**
     * cookie操作
     * @param  {[type]} name    [description]
     * @param  {[type]} value   [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    cookie: function(name, value, options) {
      if (value !== undefined) {
        this.http.setCookie(name, value, options);
        return this;
      }
      return name === undefined ? this.http.cookie : (this.http.cookie[name] || '');
    },
    /**
     * session
     * 如果是get操作，则返回一个promise
     * @param  {[type]} name  [description]
     * @param  {[type]} value [description]
     * @return {[type]}       [description]
     */
    session: function(name, value) {
      thinkRequire('Session').start(this.http);
      var instance = this.http.session;
      if (name === undefined) {
        return instance.rm();
      }
      if (value !== undefined) {
        return instance.set(name, value);
      }
      return instance.get(name);
    },
    /**
     * 跳转，返回一个pendding promise阻止后面继续执行
     * @param  {[type]} url  [description]
     * @param  {[type]} code [description]
     * @return {[type]}      [description]
     */
    redirect: function(url, code) {
      this.http.redirect(url, code);
      return getDefer().promise;
    },
    /**
     * 赋值变量到模版
     * @param  {[type]} name  [description]
     * @param  {[type]} value [description]
     * @return {[type]}       [description]
     */
    assign: function(name, value) {
      if (arguments.length === 1) {
        return this.initView().assign(name);
      }
      return this.initView().assign(name, value);
    },
    /**
     * 获取解析后的模版内容
     * @param  {[type]} templateFile [description]
     * @param  {[type]} content      [description]
     * @return {[type]}              [description]
     */
    fetch: function(templateFile, content) {
      return this.initView().fetch(templateFile, content);
    },
    /**
     * 输出模版内容
     * @param  {[type]} templateFile [description]
     * @param  {[type]} charset      [description]
     * @param  {[type]} contentType  [description]
     * @param  {[type]} content      [description]
     * @return {[type]}              [description]
     */
    display: function(templateFile, charset, contentType, content) {
      return this.initView().display(templateFile, charset, contentType, content);
    },
    /**
     * 调用另一个controll里的aciton
     * 可以跨分组
     * A('Admin/Test/index')
     * @param  {[type]} action [description]
     * @return {[type]}        [description]
     */
    action: function(action, data) {
      //自动补group
      action = action.replace(/\//g, ':');
      if (action.split(':').length === 2) {
        action = this.http.group + ':' + action;
      }
      return A(action, this.http, data);
    },
    /**
     * jsonp格式输出
     * @param  {[type]} data  [description]
     * @param  {[type]} jsonp [description]
     * @return {[type]}       [description]
     */
    jsonp: function(data) {
      this.type(C('json_content_type'));
      var callback = this.get(C('url_callback_name'));
      //过滤callback值里的非法字符
      callback = callback.replace(callbackReg, '');
      if (callback) {
        this.echo(callback + '(');
        this.echo(data);
        this.end(')');
      } else {
        this.end(data);
      }
    },
    /**
     * json格式输出
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    json: function(data){
      this.type(C('json_content_type'));
      return this.end(data);
    },
    /**
     * 设置http响应状态码
     * @param  {[type]} status [description]
     * @return {[type]}        [description]
     */
    status: function(status) {
      var res = this.http.res;
      if (!res.headersSent) {
        res.statusCode = status || 404;
      }
      return this;
    },
    /**
     * 阻止访问
     * @param  {[type]} status [description]
     * @return {[type]}        [description]
     */
    deny: function(status){
      var res = this.http.res;
      if (!res.headersSent) {
        res.statusCode = status || 403;
        this.http.end();
      }
      return getDefer().promise;
    },
    /**
     * 输出内容
     * 自动JSON.stringify
     * 自定将数字等转化为字符串
     * @param  {[type]} obj [description]
     * @return {[type]}     [description]
     */
    echo: function(obj, encoding) {
      //自动发送Content-Type的header
      if (C('auto_send_content_type')) {
        this.type(C('tpl_content_type'));
      }
      return this.http.echo(obj, encoding);
    },
    /**
     * 结束输出，输出完成时一定要调用这个方法
     * @param  {[type]} obj [description]
     * @return {[type]}     [description]
     */
    end: function(obj, encoding) {
      if (obj) {
        this.echo(obj, encoding);
      }
      this.http.end();
    },
    /**
     * 发送Content-Type
     * @param  {[type]} type [description]
     * @return {[type]}      [description]
     */
    type: function(ext){
      if (ext.indexOf('/') === -1) {
        ext = require('mime').lookup(ext);
      }
      if (!this.http.cthIsSend) {
        if (ext.toLowerCase().indexOf('charset=') === -1) {
          ext += '; charset=' + C('encoding');
        }
        //Content-Type Header has been Send
        this.http.cthIsSend = true;
        this.http.setHeader('Content-Type', ext);
      }else{
        console.log('Content-Type has been send');
      }
    },
    /**
     * 下载文件
     * @return {[type]} [description]
     */
    download: function(file, contentType, callback) {
      if (isFunction(contentType)) {
        callback = contentType;
        contentType = '';
      }
      if (!contentType || contentType.indexOf('/') === -1) {
        contentType = require('mime').lookup(contentType || file);
      }
      var http = this.http;
      var fileStream = fs.createReadStream(file);
      this.type(contentType);
      http.setHeader('Content-Disposition', 'attachment; filename="' + path.basename(file) + '"');
      fileStream.pipe(http.res);
      fileStream.on('end', function() {
        http.end();
        return callback && callback();
      });
    },
    /**
     * 正常json数据输出
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    success: function(data){
      var obj = getObject([C('error_no_key'), C('error_msg_key')], [0, '']);
      if (data !== undefined) {
        obj.data = data;
      }
      this.type(C('json_content_type'));
      this.end(obj);
      return getDefer().promise;
    },
    /**
     * 异常json数据数据
     * @param  {[type]} errno  [description]
     * @param  {[type]} errmsg [description]
     * @param  {[type]} extra  [description]
     * @return {[type]}        [description]
     */
    error: function(errno, errmsg, data){
      var obj;
      if (isObject(errno)) {
        data = errmsg;
        obj = extend({}, errno);
      }else{
        if (!isNumber(errno)) {
          data = errmsg;
          errmsg = errno;
          errno = C('error_no_default_value');
        }
        obj = getObject([C('error_no_key'), C('error_msg_key')], [errno, errmsg]);
      }
      if (data !== undefined) {
        obj.data = data;
      }
      this.type(C('json_content_type'));
      this.end(obj);
      return getDefer().promise;
    },
    /**
     * 发送执行时间
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    sendTime: function(name){
      return this.http.sendTime(name);
    },
    /**
     * 对数据进行过滤
     * @param  {[type]} data [description]
     * @param  {[type]} type [description]
     * @return {[type]}      [description]
     */
    filter: function() {
      var filter = thinkRequire('Filter').filter;
      return filter.apply(null, arguments);
    },
    /**
     * 校验一个值是否合法
     * @param  {[type]} data      [description]
     * @param  {[type]} validType [description]
     * @return {[type]}           [description]
     */
    valid: function(data, validType) {
      //单个值检测，只返回是否正常
      if (validType !== undefined) {
        data = [{
          value: data,
          valid: validType
        }];
        var result = thinkRequire('Valid').check(data);
        return result.length === 0;
      }
      return thinkRequire('Valid').check(data);
    }
  };
});