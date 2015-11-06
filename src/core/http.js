'use strict';

import url from 'url';
import {EventEmitter} from 'events';
import fs from 'fs';
import mime from 'mime';
import util from 'util';

let cookie = think.require('cookie');

/**
 * wrap for request & response
 * @type {Object}
 */
export default class extends think.base {
  /**
   * init method
   * @param  {Object} req [request]
   * @param  {Object} res [response]
   * @return {}     []
   */
  init(req, res){
    //request object
    this.req = req;
    //response object
    this.res = res;
    //instance of EventEmitter
    this.http = new EventEmitter();

    this.http.req = req;
    this.http.res = res;
    //set http start time
    this.http.startTime = Date.now();

    //set request timeout
    let timeout = think.config('timeout');
    if(timeout){
      res.setTimeout(timeout * 1000, () => {
        this.http.emit('timeout');
        this.http.end();
      });
    }
  }
  /**
   * exec
   * @return Promise            []
   */
  async run(){
    this.bind();
    
    await think.hook('request_begin', this.http);
    //array indexOf is faster than string
    let methods = ['POST', 'PUT', 'PATCH'];
    if (methods.indexOf(this.req.method) > -1) {
      await this.parsePayload();
    }
    return this.http;
  }
  /**
   * check request has post data
   * @return {Boolean} []
   */
  hasPayload(){
    if ('transfer-encoding' in this.req.headers) {
      return true;
    }
    return (this.req.headers['content-length'] | 0) > 0;
  }
  /**
   * get payload data
   * @return {Promise} []
   */
  getPayload(){

    if(think.isString(this.payload)){
      return Promise.resolve(this.payload);
    }

    //payload data has readed by third middleware
    if(!this.req.readable){
      return Promise.resolve('');
    }

    let buffers = [];
    let deferred = think.defer();
    this.req.on('data', chunk => {
      buffers.push(chunk);
    });
    this.req.on('end', () => {
      this.payload = Buffer.concat(buffers).toString();
      deferred.resolve(this.payload);
    });
    this.req.on('error', () => {
      this.res.statusCode = 400;
      this.end();
    });
    return deferred.promise;
  }
  /**
   * parse payload from request
   * @return {Promise} []
   */
  async parsePayload(){
    if(this.hasPayload()){
      await think.hook('payload_parse', this.http);
      await think.hook('payload_validate', this.http);
    }
  }
  /**
   * bind props & methods to http
   * @return {} []
   */
  bind(){
    let http = this.http;
    http.url = this.req.url;
    http.version = this.req.httpVersion;
    http.method = this.req.method;
    http.headers = this.req.headers;

    let urlInfo = url.parse('//' + http.headers.host + this.req.url, true, true);
    let pathname = decodeURIComponent(urlInfo.pathname);
    http.pathname = this.normalizePathname(pathname);
    http.query = urlInfo.query;
    http.host = urlInfo.host;
    http.hostname = urlInfo.hostname;

    http._file = {};
    http._post = {};
    http._cookie = cookie.parse(http.headers.cookie);
    http._sendCookie = {};
    http._get = think.extend({}, urlInfo.query);
    http._type = (http.headers['content-type'] || '').split(';')[0].trim();
    http._contentTypeIsSend = false;

    http.getPayload = this.getPayload;
    http.config = this.config;
    http.referrer = this.referrer;
    http.userAgent = this.userAgent;
    http.isGet = this.isGet;
    http.isPost = this.isPost;
    http.isAjax = this.isAjax;
    http.isJsonp = this.isJsonp;
    http.get = this.get;
    http.post = this.post;
    http.param = this.param;
    http.file = this.file;
    http.header = this.header;
    http.status = this.status;
    http.ip = this.ip;
    http.lang = this.lang;
    http.theme = this.theme;
    http.cookie = this.cookie;
    http.redirect = this.redirect;
    http.write = this.write;
    http.end = this.end;
    http._end = this._end;
    http.sendTime = this.sendTime;
    http.type = this.type;
    http.success = this.success;
    http.fail = this.fail;
    http.jsonp = this.jsonp;
    http.json = this.json;
    http.view = this.view;
    http.expires = this.expires;
    http.locale = this.locale;
    http.session = this.session;
  }
  /**
   * normalize pathname, remove hack chars
   * @param  {String} pathname []
   * @return {String}          []
   */
  normalizePathname(pathname){
    let length = pathname.length;
    let i = 0, chr, result = [], value = '';
    while(i < length){
      chr = pathname[i++];
      if(chr === '/' || chr === '\\'){
        if(value && value[0] !== '.'){
          result.push(value);
        }
        value = '';
      }else{
        value += chr;
      }
    }
    if(value && value[0] !== '.'){
      result.push(value);
    }
    return result.join('/');
  }
  /*
   * get or set config
   * @param  {string} name  [config name]
   * @param  {mixed} value [config value]
   * @return {mixed}       []
   */
  config(name, value){
    return think.config(name, value, this._config);
  }
  /**
   * get or set content type
   * @param  {String} ext [file ext]
   * @return {}     []
   */
  type(contentType, encoding){
    if (!contentType) {
      return this._type;
    }
    if (this._contentTypeIsSend) {
      return;
    }
    if (contentType.indexOf('/') === -1) {
      contentType = mime.lookup(contentType);
    }
    if (encoding !== false && contentType.toLowerCase().indexOf('charset=') === -1) {
      contentType += '; charset=' + (encoding || this.config('encoding'));
    }
    this.header('Content-Type', contentType);
  }
  /**
   * get user agent
   * @return {String} []
   */
  userAgent(){
    return this.headers['user-agent'] || '';
  }
  /**
   * get page request referrer
   * @param  {String} host [only get referrer host]
   * @return {String}      []
   */
  referrer(host){
    let referrer = this.headers.referer || this.headers.referrer || '';
    if (!referrer || !host) {
      return referrer;
    }
    let info = url.parse(referrer);
    return info.hostname;
  }
  /**
   * check http method is get
   * @return {Boolean} []
   */
  isGet(){
    return this.method === 'GET';
  }
  /**
   * check http method is post
   * @return {Boolean} []
   */
  isPost(){
    return this.method === 'POST';
  }
  /**
   * is ajax request
   * @param  {String}  method []
   * @return {Boolean}        []
   */
  isAjax(method) {
    if (method && this.method !== method.toUpperCase()) {
      return false;
    }
    return this.headers['x-requested-with'] === 'XMLHttpRequest';
  }
  /**
   * is jsonp request
   * @param  {String}  name [callback name]
   * @return {Boolean}      []
   */
  isJsonp(name){
    name = name || this.config('callback_name');
    return !!this.get(name);
  }
  /**
   * get or set get params
   * @param  {String} name []
   * @return {Object | String}      []
   */
  get(name, value){
    if (value === undefined) {
      if (name === undefined) {
        return this._get;
      }else if (think.isString(name)) {
        return this._get[name] || '';
      }
      this._get = name;
    }else{
      this._get[name] = value;
    }
  }
  /**
   * get or set post params
   * @param  {String} name []
   * @return {Object | String}      []
   */
  post(name, value){
    if (value === undefined) {
      if (name === undefined) {
        return this._post;
      }else if (think.isString(name)) {
        return this._post[name] || '';
      }
      this._post = name;
    }else {
      this._post[name] = value;
    }
  }
  /**
   * get post or get params
   * @param  {String} name []
   * @return {Object | String}      []
   */
  param(name){
    if (name === undefined) {
      return think.extend({}, this._get, this._post);
    }
    return this._post[name] || this._get[name] || '';
  }
  /**
   * get or set file data
   * @param  {String} name []
   * @return {Object}      []
   */
  file(name, value){
    if (value === undefined) {
      if (name === undefined) {
        return this._file;
      }
      return this._file[name] || {};
    }
    this._file[name] = value;
  }
  /**
   * get or set header
   * @param  {String} name  [header name]
   * @param  {String} value [header value]
   * @return {}       []
   */
  header(name, value){
    if (name === undefined) {
      return this.headers;
    }else if (value === undefined) {
      return this.headers[name] || '';
    }
    //check content type is send
    if (name.toLowerCase() === 'content-type') {
      if (this._contentTypeIsSend) {
        return;
      }
      this._contentTypeIsSend = true;
    }
    //set header
    if (!this.res.headersSent) {
      this.res.setHeader(name, value);
    }
  }
  /**
   * set http status
   * @param  {Number} status []
   * @return {}        []
   */
  status(status = 200){
    let res = this.res;
    if (!res.headersSent) {
      res.statusCode = status;
    }
    return this;
  }
  /**
   * get uesr ip
   * @return {String} [ip4 or ip6]
   */
  ip(forward){
    let proxy = think.config('proxy_on') || this.host === this.hostname;
    let ip;
    if (proxy) {
      if (forward) {
        return (this.headers['x-forwarded-for'] || '').split(',').filter(item => {
          item = item.trim();
          if (think.isIP(item)) {
            return item;
          }
        });
      }
      ip = this.headers['x-real-ip'];
    }else{
      let connection = this.req.connection;
      let socket = this.req.socket;
      if (connection && connection.remoteAddress !== '127.0.0.1') {
        ip = connection.remoteAddress;
      }else if (socket && socket.remoteAddress !== '127.0.0.1') {
        ip = socket.remoteAddress;
      }
    }
    if (!ip) {
      return '127.0.0.1';
    }
    if (ip.indexOf(':') > -1) {
      ip = ip.split(':').slice(-1)[0];
    }
    if (!think.isIP(ip)) {
      return '127.0.0.1';
    }
    return ip;
  }
  /**
   * get or set language
   * @return {String}           []
   */
  lang(lang, asViewPath){
    if(lang){
      this._lang = lang;
      this._langAsViewPath = asViewPath;
      return;
    }
    //get from property
    if(this._lang){
      return this._lang;
    }
    //get from cookie
    let key = this.config('locale').cookie_name;
    let value = this.cookie(key);
    if(value){
      this._lang = value;
      return value;
    }
    //get from header
    lang = this.header('accept-language');
    this._lang = lang.split(',')[0];
    return this._lang;
  }
  /**
   * get or set theme
   * @param  {String} theme []
   * @return {String}       []
   */
  theme(theme){
    if(theme){
      this._theme = theme;
      return;
    }
    return this._theme;
  }
  /**
   * get or set cookie
   * @param  {} name    []
   * @param  {} value   []
   * @param  {} options []
   * @return {}         []
   */
  cookie(name, value, options){
    //send cookies
    if (name === true) {
      if (think.isEmpty(this._sendCookie)) {
        return;
      }
      let cookies = Object.values(this._sendCookie).map((item) => {
        return cookie.stringify(item.name, item.value, item);
      });
      this.header('Set-Cookie', cookies);
      this._sendCookie = {};
      return;
    }else if (name === undefined) {
      return this._cookie;
    }else if (value === undefined) {
      return this._cookie[name] || '';
    }
    //set cookie
    if (typeof options === 'number') {
      options = {timeout: options};
    }
    options = think.extend({}, this.config('cookie'), options);
    if (value === null) {
      options.timeout = -1000;
    }
    if (options.timeout !== 0) {
      options.expires = new Date(Date.now() + options.timeout * 1000);
    }
    if(options.timeout > 0){
      options.maxage = options.timeout;
    }
    options.name = name;
    options.value = value;
    this._sendCookie[name] = options;
  }
  /**
   * redirect
   * @param  {String} url  [redirect url]
   * @param  {Number} code []
   * @return {}      []
   */
  redirect(url, code){
    this.res.statusCode = code || 302;
    this.header('Location', url || '/');
    this.end();
  }
  /**
   * send time
   * @param  {String} name [time type]
   * @return {}      []
   */
  sendTime(name){
    let time = Date.now() - this.startTime;
    this.header('X-' + (name || 'EXEC-TIME'), time + 'ms');
  }
  /**
   * output with success errno & errmsg
   * @param  {Object} data    [output data]
   * @param  {String} message [errmsg]
   * @return {Promise}         [pedding promise]
   */
  success(data = '', message = ''){
    let error = this.config('error');
    let obj = {
      [error.key]: 0,
      [error.msg]: message,
      data: data
    };
    this.type(this.config('json_content_type'));
    this.end(obj);
  }
  /**
   * output with fail errno & errmsg
   * @param  {Number} errno  [error number]
   * @param  {String} errmsg [error message]
   * @param  {Object} data   [output data]
   * @return {Promise}        [pedding promise]
   */
  fail(errno, errmsg = '', data = ''){
    let obj;
    let error = this.config('error');
    if (think.isObject(errno)) {
      obj = think.extend({}, errno);
    }else{
      if(/^[A-Z\_]+$/.test(errno)){
        let msg = this.locale(errno);
        if(think.isArray(msg)){
          errno = msg[0];
          errmsg = msg[1];
        }
      }
      if (!think.isNumber(errno)) {
        data = errmsg;
        errmsg = errno;
        errno = error.default_errno;
      }
      // if(!think.isString(errmsg)){
      //   data = errmsg;
      //   errmsg = '';
      // }
      //read errmsg from config/locale/[lang].js
      if(errmsg === undefined){
        errmsg = this.locale(errno) || '';
      }
      obj = {
        [error.key]: errno,
        [error.msg]: errmsg
      };
      if(data){
        obj.data = data;
      }
    }
    this.type(this.config('json_content_type'));
    this.end(obj);
  }
  /**
   * output with jsonp
   * @param  {Object} data [output data]
   * @return {}      []
   */
  jsonp(data) {
    this.type(this.config('json_content_type'));
    let callback = this.get(this.config('callback_name'));
    //remove unsafe chars
    callback = callback.replace(/[^\w\.]/g, '');
    if (callback) {
      data = callback + '(' + (data !== undefined ? JSON.stringify(data) : '') + ')';
    }
    this.end(data);
  }
  /**
   * output with json
   * @param  {Object} data [output data]
   * @return {Promise}      []
   */
  json(data){
    this.type(this.config('json_content_type'));
    this.end(data);
  }
  /**
   * get view instance
   * @return {Object} []
   */
  view(){
    if (!this._view) {
      let cls = think.require('view');
      this._view = new cls(this);
    }
    return this._view;
  }
  /**
   * set cache-control and expires header
   * @return {} []
   */
  expires(time){
    time = time * 1000;
    let date = new Date(Date.now() + time);
    this.header('Cache-Control', `max-age=${time}`);
    this.header('Expires', date.toUTCString());
  }
  /**
   * get locale value
   * @param  {String} key []
   * @return {String}     []
   */
  locale(key, ...data){
    let lang = this.lang();
    let locales = this.config(think.dirname.locale);
    let values = locales[lang] || {};
    let defaultLocales = locales[this.config('locale.default')];
    if(!key){
      return think.isEmpty(values) ? defaultLocales : values;
    }
    let value = values[key] || defaultLocales[key] || key;
    if(!think.isString(value)){
      return value;
    }
    return util.format(value, ...data);
  }
   /**
   * get or set session
   * @param  {String} name  [session name]
   * @param  {mixed} value [session value]
   * @return {Promise}       []
   */
  session(name, value) {
    think.session(this);
    let instance = this._session;
    if (name === undefined) {
      return instance.delete();
    }
    if (value !== undefined) {
      return instance.set(name, value);
    }
    return instance.get(name);
  }
  /**
   * write content
   * @param  {mixed} obj      []
   * @param  {String} encoding []
   * @return {Promise}          []
   */
  write(obj, encoding = this.config('encoding')){
    if(!this.res.connection){
      return;
    }
    this.type(this.config('view.content_type'));
    this.cookie(true);
    if (obj === undefined) {
      return;
    }
    if (think.isArray(obj) || think.isObject(obj)) {
      obj = JSON.stringify(obj);
    }else if (!think.isBuffer(obj)) {
      obj += '';
    }
    let outputConfig = this.config('output_content');
    if (!outputConfig) {
      return this.res.write(obj, encoding);
    }
    if (!this._outputContentPromise) {
      this._outputContentPromise = [];
    }
    let fn = think.co.wrap(outputConfig);
    let promise = fn(obj, encoding, this);
    this._outputContentPromise.push(promise);
  }
  /**
   * end
   * @return {} []
   */
  _end(){
    this.cookie(true);
    this.res.end();
    this.emit('afterEnd', this);

    //show request info
    if(this.config('log_request')){
      think.log(colors => {
        let msg = [
          this.method, this.url,
          colors.cyan(`${this.res.statusCode}`)
        ].join(' ');
        return msg;
      }, 'HTTP', this.startTime);
    }

    //remove upload tmp files
    if (!think.isEmpty(this._file)) {
      var key, filepath;
      for(key in this._file){
        filepath = this._file[key].path;
        if (think.isFile(filepath)) {
          fs.unlink(filepath, () => {});
        }
      }
    }
  }
  /**
   * http end
   * @return {} []
   */
  end(obj, encoding){
    this.write(obj, encoding);
    //set http end flag
    this._isEnd = true;
    if (!this._outputContentPromise) {
      return this._end();
    }

    return Promise.all(this._outputContentPromise).then(() => {
      this._outputContentPromise = undefined;
      this._end();
    }).catch(() => {
      this._end();
    });
  }
}