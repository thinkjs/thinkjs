'use strict';

import path from 'path';
/**
 * base controller class
 * all controllers will inherits this class
 */
export default class extends think.http.base {
  /**
   * init
   * @return {void} []
   */
  init(http){
    this.http = http;
    this._baseAssigned = false;
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
   * get http method
   * @return {String} []
   */
  method(){
    return this.http.method.toLowerCase();
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
   * check http method is get
   * @return {Boolean} []
   */
  isGet(){
    return this.http.isGet();
  }
  /**
   * check http method is post
   * @return {Boolean} []
   */
  isPost(){
    return this.http.isPost();
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
    return !!this.http.socket;
  }
  /**
   * check is command line invoke
   * @return {Boolean} []
   */
  isCli(){
    return this.http.isCli();
  }
  /**
   * check is jsonp
   * @param  {String}  name [callback name]
   * @return {Boolean}      []
   */
  isJsonp(name){
    return this.http.isJsonp(name);
  }
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
    return this.http.userAgent();
  }
  /**
   * get page referer
   * @param  {String} host [only get referer host]
   * @return {String}      []
   */
  referrer(onlyHost){
    return this.http.referrer(onlyHost);
  }
  /**
   * get page referer
   * @param  {String} host [only get referer host]
   * @return {String}      []
   */
  referer(onlyHost){
    return this.http.referrer(onlyHost);
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
    return this.http.session(name, value);
  }
  /**
   * get language
   * @param  {Boolean} useCookie [get from cookie set]
   * @return {String}           []
   */
  lang(lang, asViewPath){
    return this.http.lang(lang, asViewPath);
  }
  /**
   * get locale value
   * @param  {String} key []
   * @return {String}     []
   */
  locale(key, ...data){
    return this.http.locale(key, ...data);
  }
  /**
   * redirect
   * @param  {String} url  [redirect url]
   * @param  {Number} code [301 or 302]
   * @return {promise}      [pedding promise]
   */
  redirect(url, code) {
    this.http.redirect(url, code);
    return think.prevent();
  }
  /**
   * assign value to template
   * @param  {String} name  [template name]
   * @param  {mixed} value []
   * @return {}       []
   */
  assign(name, value) {
    this._baseAssign();
    return this.view().assign(name, value);
  }
  /**
   * base assign
   * @return {} []
   */
  _baseAssign(){
    if(this._baseAssigned){
      return;
    }
    this._baseAssigned = true;
    this.view().assign({
      controller: this,
      http: this.http,
      config: this.http._config,
      _: this.locale.bind(this)
    });
  }
  /**
   * fetch template content
   * @param  {String} templateFile [template filepath]
   * @return {promise}              []
   */
  fetch(templateFile, data, config) {
    this._baseAssign();
    return this.view().fetch(templateFile, data, config);
  }
  /**
   * display template
   * @param  {String} templateFile [template filepath]
   * @param  {String} charset      [content encoding]
   * @param  {String} contentType  [content type]
   * @return {Promise}              []
   */
  display(templateFile, charset, contentType) {
    this._baseAssign();
    return this.view().display(templateFile, charset, contentType);
  }
  /**
   * alias of display
   * @param  {String} templateFile [template filepath]
   * @param  {String} charset      [content encoding]
   * @param  {String} contentType  [content type]
   * @return {Promise}              []
   */
  render(templateFile, charset, contentType){
    return this.display(templateFile, charset, contentType);
  }
  /**
   * output with jsonp
   * @param  {Object} data [output data]
   * @return {}      []
   */
  jsonp(data) {
    this.http.jsonp(data);
    return think.prevent();
  }
  /**
   * output with json
   * @param  {Object} data [output data]
   * @return {Promise}      []
   */
  json(data){
    this.http.json(data);
    return think.prevent();
  }
  /**
   * set http status code
   * @param  {Number} status [status code]
   * @return {}        []
   */
  status(status = 404) {
    this.http.status(status);
    return this;
  }
  /**
   * deny request
   * @param  {Number} status [status code]
   * @return {[type]}        []
   */
  deny(status = 403){
    this.status(status);
    this.http.end();
    return think.prevent();
  }
  /**
   * set cache-control and expires header
   * @param  {Number} time []
   * @return {}      []
   */
  expires(time){
    this.http.expires(time);
    return this;
  }
  /**
   * write content
   * @param  {mixed} obj      []
   * @param  {String} encoding [content encoding]
   * @return {}          []
   */
  write(obj, encoding) {
    return this.http.write(obj, encoding);
  }
  /**
   * end output
   * @param  {Object} obj      []
   * @param  {String} encoding [content encoding]
   * @return {}          []
   */
  end(obj, encoding) {
    this.http.end(obj, encoding);
    return think.prevent();
  }
  /**
   * send content
   * @param  {Mixed} obj      []
   * @param  {String} encoding []
   * @return {Promise}          []
   */
  send(obj, encoding){
    return this.end(obj, encoding);
  }
  /**
   * get or set content type
   * @param  {String} ext [content type]
   * @return {}     []
   */
  type(ext, encoding){
    return this.http.type(ext, encoding);
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
    this.type(contentType, false);

    this.header('Content-Disposition', 'attachment; filename="' + (filename || path.basename(filepath)) + '"');
    return think.middleware('output_resource', this.http, filepath);
  }
  /**
   * output with success errno & errmsg
   * @param  {Object} data    [output data]
   * @param  {String} message [errmsg]
   * @return {Promise}         [pedding promise]
   */
  success(data, message){
    this.http.success(data, message);
    return think.prevent();
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
    return think.prevent();
  }
  /**
   * alias for fail
   * @param  {} args []
   * @return {Promise}         []
   */
  error(...args){
    return this.fail(...args);
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
   * emit socket data
   * @param  {String} event []
   * @param  {Miex} data  []
   * @return {}       []
   */
  emit(event, data){
    if(!this.http.socket){
      throw new Error('emit method can only used in websocket request');
    }
    return this.http.socketEmit(event, data);
  }
  /**
   * broadcast socket data
   * @param  {String} event       []
   * @param  {Mixed} data        []
   * @param  {Boolean} containSelf []
   * @return {}             []
   */
  broadcast(event, data, containSelf){
    if(!this.http.socket){
      throw new Error('broadcast method can only used in websocket request');
    }
    return this.http.socketBroadcast(event, data, containSelf);
  }
}