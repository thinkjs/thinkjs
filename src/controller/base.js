'use strict';

var fs = require('fs');
var path = require('path');

module.exports = class extends think.Base{
  /**
   * init
   * @return {void} []
   */
  constructor(http){
    super(http);
    this.assign('controller', this);
    this.assign('http', this.http);
    this.assign('config', this.http._config);
  }
  /**
   * get client ip
   * @return {String} []
   */
  ip(){
    return this.http.ip();
  }
  /**
   * init view instance
   * @return {Object} []
   */
  view(){
    return this.http.view();
  }
  /**
   * check http method is get
   * @return {Boolean} []
   */
  isGet(){
    return this.http.method === 'GET';
  }
  /**
   * check http method is post
   * @return {Boolean} []
   */
  isPost(){
    return this.http.method === 'POST';
  }
  /**
   * check http method
   * @param  {String}  method [http method]
   * @return {Boolean}        []
   */
  isMethod(method){
    return this.http.method === method.toUpperCase();
  }
  /**
   * check is ajax request
   * @param  {String}  method [http method]
   * @return {Boolean}        []
   */
  isAjax(method) {
    return this.http.isAjax(method);
  }
  /**
   * check is websocket request
   * @return {Boolean} []
   */
  isWebSocket(){
    return !!this.http.websocket;
  }
  /**
   * check is command line invoke
   * @return {Boolean} []
   */
  isCli(){
    return think.cli;
  }
  /**
   * check is jsonp
   * @param  {String}  name [callback name]
   * @return {Boolean}      []
   */
  isJsonp(name){
    return this.http.isJsonp(name);
  }
  // token(token){
  //   var tokenName = this.config('token_name');
  //   var self = this;
  //   if (token) {
  //     return this.session(tokenName).then(function(value){
  //       return value === token;
  //     })
  //   }else{
  //     return this.session(tokenName).then(function(token){
  //       if (token) {
  //         return token;
  //       }
  //       token = thinkRequire('Session').uid(32);
  //       return self.session(tokenName, token).then(function(){
  //         return token;
  //       })
  //     })
  //   }
  // }
  /**
   * get get params
   * @param  {String} name [query name]
   * @return {String}      []
   */
  get(name, value){
    return this.http.get(name, value);
  }
  /**
   * get post params
   * @param  {String} name [query name]
   * @return {String}      []
   */
  post(name, value) {
    return this.http.post(name, value);
  }
  /**
   * get post or get params
   * @param  {String} name []
   * @return {String}      []
   */
  param(name) {
    return this.http.param(name);
  }
  /**
   * get upload files
   * @param  {String} name []
   * @return {Object}      []
   */
  file(name, value) {
    return this.http.file(name, value);
  }
  /**
   * get or set header
   * @param  {String} name  [header name]
   * @param  {String} value [header value]
   * @return {}       []
   */
  header(name, value) {
    return this.http.header(name, value);
  }
  /**
   * get user agent
   * @return {String} []
   */
  userAgent(){
    return this.http.headers['user-agent'] || '';
  }
  /**
   * get page referer
   * @param  {String} host [only get referer host]
   * @return {String}      []
   */
  referer(onlyHost){
    return this.http.referer(onlyHost);
  }
  /**
   * get or set cookie
   * @param  {String} name    [cookie name]
   * @param  {String} value   [cookie value]
   * @param  {Object} options [cookie options]
   * @return {}         []
   */
  cookie(name, value, options) {
    return this.http.cookie(name, value, options);
  }
  /**
   * get or set session
   * @param  {String} name  [session name]
   * @param  {mixed} value [session value]
   * @return {Promise}       []
   */
  session(name, value) {
    think.session(this.http);
    let instance = this.http.session;
    if (name === undefined) {
      return instance.rm();
    }
    if (value !== undefined) {
      return instance.set(name, value);
    }
    return instance.get(name);
  }
  /**
   * redirect
   * @param  {String} url  [redirect url]
   * @param  {Number} code [301 or 302]
   * @return {promise}      [pedding promise]
   */
  redirect(url, code) {
    this.http.redirect(url, code);
    return think.defer().promise;
  }
  /**
   * assign value to template
   * @param  {String} name  [template name]
   * @param  {mixed} value []
   * @return {}       []
   */
  assign(name, value) {
    return this.view().assign(name, value);
  }
  /**
   * fetch template content
   * @param  {String} templateFile [template filepath]
   * @return {promise}              []
   */
  fetch(templateFile) {
    return this.view().fetch(templateFile);
  }
  /**
   * display template 
   * @param  {String} templateFile [template filepath]
   * @param  {String} charset      [content encoding]
   * @param  {String} contentType  [content type]
   * @return {Promise}              []
   */
  display(templateFile, charset, contentType) {
    return this.view().display(templateFile, charset, contentType);
  }
  /**
   * output with jsonp
   * @param  {Object} data [output data]
   * @return {}      []
   */
  jsonp(data) {
    this.http.jsonp(data);
    return think.defer().promise;
  }
  /**
   * output with json
   * @param  {Object} data [output data]
   * @return {Promise}      []
   */
  json(data){
    this.http.json(data);
    return think.defer().promise;
  }
  /**
   * set http status code
   * @param  {Number} status [status code]
   * @return {}        []
   */
  status(status) {
    let res = this.http.res;
    if (!res.headersSent) {
      res.statusCode = status || 404;
    }
    return this;
  }
  /**
   * deny request
   * @param  {Number} status [status code]
   * @return {[type]}        []
   */
  deny(status){
    this.status(status || 403);
    return this.end();
  }
  /**
   * echo content
   * @param  {mixed} obj      []
   * @param  {String} encoding [content encoding]
   * @return {}          []
   */
  echo(obj, encoding) {
    return this.http.echo(obj, encoding);
  }
  /**
   * end output
   * @param  {Object} obj      []
   * @param  {String} encoding [content encoding]
   * @return {}          []
   */
  end(obj, encoding) {
    this.http.end(obj, encoding);
    return think.defer().promise;
  }
  /**
   * get or set content type
   * @param  {String} ext [content type]
   * @return {}     []
   */
  type(ext){
    return this.http.type(ext);
  }
  /**
   * download file
   * @param  {String} file        [filepath]
   * @param  {String} contentType [content type]
   * @param  {String} filename    [download filename]
   * @return {Promise}             []
   */
  download(filepath, contentType, filename) {
    if (think.isString(contentType) && contentType.indexOf('.') > -1) {
      filename = contentType;
      contentType = '';
    }
    if (!contentType || contentType.indexOf('/') === -1) {
      contentType = require('mime').lookup(contentType || filepath);
    }
    var http = this.http;
    var fileStream = fs.createReadStream(filepath);
    var deferred = think.defer();
    this.type(contentType);
    http.header('Content-Disposition', 'attachment; filename="' + (filename || path.basename(filepath)) + '"');
    fileStream.pipe(http.res);
    fileStream.on('end', () => {
      http.end();
      deferred.resolve();
    });
    fileStream.on('error', (err) => {
      deferred.reject(err);
    });
    return deferred.promise;
  }
  /**
   * output with success errno & errmsg
   * @param  {Object} data    [output data]
   * @param  {String} message [errmsg]
   * @return {Promise}         [pedding promise]
   */
  success(data, message){
    this.http.success(data, message);
    return think.defer().promise;
  }
  /**
   * output with fail errno & errmsg
   * @param  {Number} errno  [error number]
   * @param  {String} errmsg [error message]
   * @param  {Object} data   [output data]
   * @return {Promise}        [pedding promise]
   */
  fail(errno, errmsg, data){
    this.http.fail(errno, errmsg, data);
    return think.defer().promise;
  }
  error(errno, errmsg, data){
    console.log('this.error() is deprecated, please use this.fail() instead.');
    return this.fail(errno, errmsg, data);
  }
  /**
   * close db connections
   * @return {} []
   */
  closeDb(){
    //think.require('Model').close();
  }
  /**
   * send exec time
   * @param  {String} name [header name]
   * @return {}      []
   */
  sendTime(name){
    return this.http.sendTime(name);
  }
  /**
   * validate data
   * @param  {Object} data      []
   * @param  {String} validType []
   * @return {}           []
   */
  valid(data) {
    return think.valid(data);
  }
}