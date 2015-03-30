'use strict';

var fs = require('fs');
var path = require('path');
var url = require('url');
var util = require('util');

module.exports = think.Class({
  /**
   * init
   * @return {void} []
   */
  init: function(http){
    this.http = http;
    this.assign('controller', this);
    this.assign('http', this.http);
    this.assign('config', this.http._config);
  },
  /**
   * get client ip
   * @return {String} []
   */
  ip: function(){
    return this.http.ip();
  },
  /**
   * init view instance
   * @return {Object} []
   */
  initView: function(){
    if (!this.http.view) {
      this.http.view = think.require('view')(this.http);
    }
    return this.http.view;
  },
  /**
   * check http method is get
   * @return {Boolean} []
   */
  isGet: function(){
    return this.http.method === 'GET';
  },
  /**
   * check http method is post
   * @return {Boolean} []
   */
  isPost: function(){
    return this.http.method === 'POST';
  },
  /**
   * check http method
   * @param  {String}  method [http method]
   * @return {Boolean}        []
   */
  isMethod: function(method){
    return this.http.method === method.toUpperCase();
  },
  /**
   * check is ajax request
   * @param  {String}  method [http method]
   * @return {Boolean}        []
   */
  isAjax: function(method) {
    return this.http.isAjax(method);
  },
  /**
   * check is websocket request
   * @return {Boolean} []
   */
  isWebSocket: function(){
    return !!this.http.websocket;
  },
  /**
   * check is command line invoke
   * @return {Boolean} []
   */
  isCli: function(){
    return think.mode === 'cli';
  },
  /**
   * check is jsonp
   * @param  {String}  name [callback name]
   * @return {Boolean}      []
   */
  isJsonp: function(name){
    return this.http.isJsonp(name);
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
   * get get params
   * @param  {String} name [query name]
   * @return {String}      []
   */
  get: function(name, value){
    return this.http.get(name, value);
  },
  /**
   * get post params
   * @param  {String} name [query name]
   * @return {String}      []
   */
  post: function(name, value) {
    return this.http.post(name, value);
  },
  /**
   * get post or get params
   * @param  {String} name []
   * @return {String}      []
   */
  param: function(name) {
    return this.http.param(name);
  },
  /**
   * get upload files
   * @param  {String} name []
   * @return {Object}      []
   */
  file: function(name, value) {
    return this.http.file(name, value);
  },
  /**
   * get or set header
   * @param  {String} name  [header name]
   * @param  {String} value [header value]
   * @return {}       []
   */
  header: function(name, value) {
    return this.http.header(name, value);
  },
  /**
   * get user agent
   * @return {String} []
   */
  userAgent: function(){
    return this.http.headers['user-agent'] || '';
  },
  /**
   * get page referer
   * @param  {String} host [only get referer host]
   * @return {String}      []
   */
  referer: function(onlyHost){
    return this.http.referer(onlyHost);
  },
  /**
   * get or set cookie
   * @param  {String} name    [cookie name]
   * @param  {String} value   [cookie value]
   * @param  {Object} options [cookie options]
   * @return {}         []
   */
  cookie: function(name, value, options) {
    return this.http.cookie(name, value, options);
  },
  /**
   * get or set session
   * @param  {String} name  [session name]
   * @param  {mixed} value [session value]
   * @return {Promise}       []
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
   * redirect
   * @param  {String} url  [redirect url]
   * @param  {Number} code [301 or 302]
   * @return {promise}      [pedding promise]
   */
  redirect: function(url, code) {
    this.http.redirect(url, code);
    return Promise.defer().promise;
  },
  /**
   * assign value to template
   * @param  {String} name  [template name]
   * @param  {mixed} value []
   * @return {}       []
   */
  assign: function(name, value) {
    return this.initView().assign(name, value);
  },
  /**
   * fetch template content
   * @param  {String} templateFile [template filepath]
   * @return {promise}              []
   */
  fetch: function(templateFile) {
    return this.initView().fetch(templateFile);
  },
  /**
   * display template 
   * @param  {String} templateFile [template filepath]
   * @param  {String} charset      [content encoding]
   * @param  {String} contentType  [content type]
   * @return {Promise}              []
   */
  display: function(templateFile, charset, contentType) {
    return this.initView().display(templateFile, charset, contentType);
  },
  /**
   * output with jsonp
   * @param  {Object} data [output data]
   * @return {}      []
   */
  jsonp: function(data) {
    this.http.jsonp(data);
    return Promise.defer().promise;
  },
  /**
   * output with json
   * @param  {Object} data [output data]
   * @return {Promise}      []
   */
  json: function(data){
    this.http.json(data);
    return Promise.defer().promise;
  },
  /**
   * set http status code
   * @param  {Number} status [status code]
   * @return {}        []
   */
  status: function(status) {
    var res = this.http.res;
    if (!res.headersSent) {
      res.statusCode = status || 404;
    }
    return this;
  },
  /**
   * deny request
   * @param  {Number} status [status code]
   * @return {[type]}        []
   */
  deny: function(status){
    this.status(status || 403);
    return this.end();
  },
  /**
   * echo content
   * @param  {mixed} obj      []
   * @param  {String} encoding [content encoding]
   * @return {}          []
   */
  echo: function(obj, encoding) {
    return this.http.echo(obj, encoding);
  },
  /**
   * end output
   * @param  {Object} obj      []
   * @param  {String} encoding [content encoding]
   * @return {}          []
   */
  end: function(obj, encoding) {
    this.http.end(obj, encoding);
    return Promise.defer().promise;
  },
  /**
   * get or set content type
   * @param  {String} ext [content type]
   * @return {}     []
   */
  type: function(ext){
    return this.http.type(ext);
  },
  /**
   * download file
   * @param  {String} file        [filepath]
   * @param  {String} contentType [content type]
   * @param  {String} filename    [download filename]
   * @return {Promise}             []
   */
  download: function(filepath, contentType, filename) {
    if (think.isString(contentType) && contentType.indexOf('.') > -1) {
      filename = contentType;
      contentType = '';
    }
    if (!contentType || contentType.indexOf('/') === -1) {
      contentType = require('mime').lookup(contentType || filepath);
    }
    var http = this.http;
    var fileStream = fs.createReadStream(filepath);
    var deferred = Promise.defer();
    this.type(contentType);
    http.header('Content-Disposition', 'attachment; filename="' + (filename || path.basename(filepath)) + '"');
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
   * output with success errno & errmsg
   * @param  {Object} data    [output data]
   * @param  {String} message [errmsg]
   * @return {Promise}         [pedding promise]
   */
  success: function(data, message){
    this.http.success(data, message);
    return Promise.defer().promise;
  },
  /**
   * output with fail errno & errmsg
   * @param  {Number} errno  [error number]
   * @param  {String} errmsg [error message]
   * @param  {Object} data   [output data]
   * @return {Promise}        [pedding promise]
   */
  fail: function(errno, errmsg, data){
    this.http.fail(errno, errmsg, data);
    return Promise.defer().promise;
  },
  error: function(errno, errmsg, data){
    var self = this;
    return util.deprecate(function(){
      return self.fail(errno, errmsg, data);
    }, 'this.error() is deprecated, please use this.fail() instead.')
  },
  /**
   * close db connections
   * @return {} []
   */
  closeDb: function(){
    thinkRequire('Model').close();
  },
  /**
   * send exec time
   * @param  {String} name [header name]
   * @return {}      []
   */
  sendTime: function(name){
    return this.http.sendTime(name);
  },
  /**
   * filter data
   * @return {} []
   */
  filter: function() {
    var filter = think.require('filter').filter;
    return filter.apply(null, arguments);
  },
  /**
   * validate data
   * @param  {Object} data      []
   * @param  {String} validType []
   * @return {}           []
   */
  valid: function(data, validType) {
    if (validType !== undefined) {
      data = [{
        value: data,
        valid: validType
      }];
      var result = think.require('valid')(data);
      return think.isEmpty(result);
    }
    return think.require('valid')(data);
  }
})