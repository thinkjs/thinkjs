'use strict';

var fs = require('fs');
var path = require('path');
var url = require('url');

module.exports = think.Class({
  /**
   * init
   * @return {void} []
   */
  init: function(http){
    this.http = http;
    this.view = null;
    this.assign('controller', this);
    this.assign('http', this.http);
    this.assign('config', this.http._config);
  },
  ip: function(){
    return this.http.ip();
  },
  initView: function(){
    if (!this.view) {
      this.view = think.require('view')(this.http);
    }
    return this.view;
  },
  isGet: function(){
    return this.http.isGet();
  },
  isPost: function(){
    return this.http.isPost();
  },
  isMethod: function(method){
    return this.http.method === method.toUpperCase();
  },
  isAjax: function(method) {
    if (method && this.http.method !== method.toUpperCase()) {
      return false;
    }
    return this.header('x-requested-with') === 'XMLHttpRequest';
  },
  isWebSocket: function(){
    return !!this.http.websocket;
  },
  isCli: function(){
    return !!think.cli;
  },
  isJsonp: function(name){
    name = name || this.config('url_callback_name');
    return !!this.get(name);
  },
  get: function(name){
    return this.http.get(name);
  },
  token: function(token){
    var tokenName = C('token_name');
    var self = this;
    if (token) {
      return this.session(tokenName).then(function(value){
        return value === token;
      })
    }else{
      return this.session(tokenName).then(function(token){
        if (token) {
          return token;
        }
        token = thinkRequire('Session').uid(32);
        return self.session(tokenName, token).then(function(){
          return token;
        })
      })
    }
  },
  /**
   * 获取POST参数
   * @param  {[type]} name [description]
   * @return {[type]}      [description]
   */
  post: function(name) {
    return this.http.post(name);
  },
  /**
   * 获取参数
   * @param  {[type]} name [description]
   * @return {[type]}      [description]
   */
  param: function(name) {
    return this.http.param(name);
  },
  /**
   * 获取上传的文件
   * @param  {[type]} name [description]
   * @return {[type]}      [description]
   */
  file: function(name) {
    return this.http.file(name);
  },
  /**
   * header操作
   * @param  {[type]} name  [description]
   * @param  {[type]} value [description]
   * @return {[type]}       [description]
   */
  header: function(name, value) {
    return this.http.header(name, value);
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
    return this.http.referer(host);
  },
  /**
   * cookie操作
   * @param  {[type]} name    [description]
   * @param  {[type]} value   [description]
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */
  cookie: function(name, value, options) {
    return this.http.cookie(name, value, options);
  },
  /**
   * session
   * 如果是get操作，则返回一个promise
   * @param  {[type]} name  [description]
   * @param  {[type]} value [description]
   * @return {[type]}       [description]
   */
  session: function(name, value) {
    think.http(this.http);
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
    return Promise.defer().promise;
  },
  /**
   * 赋值变量到模版
   * @param  {[type]} name  [description]
   * @param  {[type]} value [description]
   * @return {[type]}       [description]
   */
  assign: function(name, value) {
    return this.initView().assign(name, value);
  },
  /**
   * 获取解析后的模版内容
   * @param  {[type]} templateFile [description]
   * @param  {[type]} content      [description]
   * @return {[type]}              [description]
   */
  fetch: function(templateFile) {
    return this.initView().fetch(templateFile);
  },
  /**
   * 输出模版内容
   * @param  {[type]} templateFile [description]
   * @param  {[type]} charset      [description]
   * @param  {[type]} contentType  [description]
   * @param  {[type]} content      [description]
   * @return {[type]}              [description]
   */
  display: function(templateFile, charset, contentType) {
    return this.initView().display(templateFile, charset, contentType);
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
    callback = callback.replace(/[^\w\.]/g, '');
    if (callback) {
      data = callback + '(' + (data !== undefined ? JSON.stringify(data) : '') + ')';
      this.end(data);
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
    if (think.config('auto_send_content_type')) {
      this.type(this.config('tpl_content_type'));
    }
    return this.http.echo(obj, encoding);
  },
  /**
   * 结束输出，输出完成时一定要调用这个方法
   * @param  {[type]} obj [description]
   * @return {[type]}     [description]
   */
  end: function(obj, encoding) {
    if (obj !== undefined) {
      var self = this;
      return this.echo(obj, encoding).then(function(){
        self.http.end();
      });
    }
    this.http.end();
  },
  /**
   * 发送Content-Type
   * @param  {[type]} type [description]
   * @return {[type]}      [description]
   */
  type: function(ext){
    return this.http.type(ext);
  },
  /**
   * 下载文件
   * @return Promise [description]
   */
  download: function(file, contentType, filename) {
    if (isString(contentType) && contentType.indexOf('.') > -1) {
      filename = contentType;
      contentType = '';
    }
    if (!contentType || contentType.indexOf('/') === -1) {
      contentType = require('mime').lookup(contentType || file);
    }
    var http = this.http;
    var fileStream = fs.createReadStream(file);
    var deferred = getDefer();
    this.type(contentType);
    http.setHeader('Content-Disposition', 'attachment; filename="' + (filename || path.basename(file)) + '"');
    fileStream.pipe(http.res);
    fileStream.on('end', function() {
      http.end();
      deferred.resolve();
    });
    fileStream.on('error', function(err) {
      deferred.reject(err);
    });
    return deferred.promise;
  },
  /**
   * 正常json数据输出
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
  success: function(data, message){
    var obj = think.getObject([this.config('error.errno'), this.config('error.errmsg')], [0, message || '']);
    if (data !== undefined) {
      obj.data = data;
    }
    this.type(C('json_content_type'));
    this.end(obj);
    return Promise.defer().promise;
  },
  /**
   * 异常json数据数据
   * @param  {[type]} errno  [description]
   * @param  {[type]} errmsg [description]
   * @param  {[type]} extra  [description]
   * @return {[type]}        [description]
   */
  fail: function(errno, errmsg, data){
    var obj;
    if (think.isObject(errno)) {
      data = errmsg;
      obj = think.extend({}, errno);
    }else{
      if (!think.isNumber(errno)) {
        data = errmsg;
        errmsg = errno;
        errno = this.config('error.errno_value');
      }
      obj = think.getObject([this.config('error.errno'), this.config('error.errmsg')], [errno, errmsg || 'error']);
    }
    if (data !== undefined) {
      obj.data = data;
    }
    this.type(this.config('json_content_type'));
    this.end(obj);
    return Promise.defer().promise;
  },
  error: function(errno, errmsg, data){

  },
  /**
   * 关闭数据库连接
   * @return {[type]} [description]
   */
  closeDb: function(){
    thinkRequire('Model').close();
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
      var result = thinkRequire('Valid')(data);
      return isEmpty(result);
    }
    return thinkRequire('Valid')(data);
  }
})