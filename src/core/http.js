'use strict';

/**
 * wrap for request & response
 * @type {Object}
 */
import querystring from 'querystring';
import url from 'url';
import {EventEmitter} from 'events';
import os from 'os';
import path from 'path';
import fs from 'fs';
import multiparty from 'multiparty';
import mime from 'mime';

let cookie = think.require('cookie');

export default class {
  /**
   * constructor
   * @param  {} args []
   * @return {}         []
   */
  constructor(...args){
    this.init(...args);
  }
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
  run(){
    this.bind();
    //array indexOf is faster than string
    let methods = ['POST', 'PUT', 'PATCH'];
    if (methods.indexOf(this.req.method) > -1) {
      return this.getPostData();
    }
    return Promise.resolve(this.http);
  }
  /**
   * check request has post data
   * @return {Boolean} []
   */
  hasPostData(){
    if ('transfer-encoding' in this.req.headers) {
      return true;
    }
    return (this.req.headers['content-length'] | 0) > 0;
  }
  /**
   * get form file post
   * @return {Promise} []
   */
  getFormFilePost(){
    let deferred = think.defer();
    let uploadDir = think.config('post.file_upload_path');
    if (uploadDir) {
      think.mkdir(uploadDir);
    }
    let form = this.form = new multiparty.Form({
      maxFieldsSize: think.config('post.max_fields_size'),
      maxFields: think.config('post.max_fields'),
      maxFilesSize: think.config('post.max_file_size'),
      uploadDir: uploadDir
    });
    //support for file with multiple="multiple"
    let files = this.http._file;
    form.on('file', (name, value) => {
      if (name in files) {
        if (!think.isArray(files[name])) {
          files[name] = [files[name]];
        }
        files[name].push(value);
      }else{
        files[name] = value;
      }
    });
    form.on('field', (name, value) => {
      this.http._post[name] = value;
    });
    form.on('close', () => {
      deferred.resolve(this.http);
    });
    form.on('error', () => {
      this.res.statusCode = 413;
      this.http.end();
    });
    form.parse(this.req);
    return deferred.promise;
  }
  /**
   * common filed post
   * @return {Promise} []
   */
  getCommonPost(){
    let buffers = [];
    let deferred = think.defer();
    this.req.on('data', chunk => {
      buffers.push(chunk);
    });
    this.req.on('end', () => {
      this.http.payload = Buffer.concat(buffers).toString();
      this.parseFormData().then(() => {
        deferred.resolve(this.http);
      });
    });
    this.req.on('error', () => {
      this.res.statusCode = 413;
      this.http.end();
    });
    return deferred.promise;
  }
  /**
   * parse form data
   * @return {Promise} []
   */
  async parseFormData(){
    await think.hook('form_parse', this.http);
    if (think.isEmpty(this.http._post) && this.http.payload) {
      try{
        this.http._post = querystring.parse(this.http.payload);
      }catch(e){
        this.res.statusCode = 413;
        this.http.end();
        return think.prevent();
      }
    }
    let post = this.http._post;
    let length = Object.keys(post).length;
    if (length > think.config('post.max_fields')) {
      this.res.statusCode = 413;
      this.http.end();
      return think.prevent();
    }
    let maxFilesSize = think.config('post.max_fields_size');
    for(let name in post){
      if (post[name].length > maxFilesSize) {
        this.res.statusCode = 413;
        this.http.end();
        return think.prevent();
      }
    }
  }
  /**
   * upload file by ajax
   * @return {Promise} []
   */
  getAjaxFilePost(){
    let filename = this.req.headers[think.config('post.ajax_filename_header')];
    let deferred = think.defer();
    let filepath = think.config('post.file_upload_path') || (os.tmpdir() + '/thinkjs_upload');
    think.mkdir(filepath);
    let name = think.uuid(20);
    filepath += '/' + name + path.extname(filename).slice(0, 5);
    let stream = fs.createWriteStream(filepath);
    this.req.pipe(stream);
    stream.on('error', () => {
      this.res.statusCode = 413;
      this.http.end();
    });
    stream.on('close', () => {
      this.http._file.file = {
        fieldName: 'file',
        originalFilename: filename,
        path: filepath,
        size: fs.statSync(filepath).size
      };
      deferred.resolve(this.http);
    });
    return deferred.promise;
  }
  /**
   * get post data from request
   * @return {Promise} []
   */
  getPostData(){
    if (!this.hasPostData()) {
      return Promise.resolve(this.http);
    }
    let multiReg = /^multipart\/(form-data|related);\s*boundary=(?:"([^"]+)"|([^;]+))$/i;
    //file upload by form or FormData
    if (multiReg.test(this.req.headers['content-type'])) {
      return this.getFormFilePost();
    }
    //file upload by ajax
    else if(this.req.headers[think.config('post.ajax_filename_header')]){
      return this.getAjaxFilePost();
    }
    return this.getCommonPost();
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
    // in windows, path normalize will replace / to \\
    // so must be replace \\ to /
    http.pathname = path.normalize(urlInfo.pathname).replace(/\\/g, '/').slice(1);
    http.query = urlInfo.query;
    http.host = urlInfo.host;
    http.hostname = urlInfo.hostname;

    http._file = {};
    http._post = {};
    http._cookie = cookie.parse(http.headers.cookie);
    http._sendCookie = {};
    http._get = think.extend({}, urlInfo.query);
    http._type = (http.headers['content-type'] || '').split(';')[0].trim();

    http.config = this.config;
    http.referrer = this.referrer;
    http.userAgent = this.userAgent;
    http.isAjax = this.isAjax;
    http.isJsonp = this.isJsonp;
    http.get = this.get;
    http.post = this.post;
    http.param = this.param;
    http.file = this.file;
    http.header = this.header;
    http.status = this.status;
    http.ip = this.ip;
    http.cookie = this.cookie;
    http.redirect = this.redirect;
    http.echo = this.echo;
    http.end = this.end;
    http._end = this._end;
    http.sendTime = this.sendTime;
    http.type = this.type;
    http.success = this.success;
    http.fail = this.fail;
    http.jsonp = this.jsonp;
    http.json = this.json;
    http.view = this.view;
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
    if (contentType.toLowerCase().indexOf('charset=') === -1) {
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
    //set header
    if (!this.res.headersSent) {
      //check content type is send
      if (name === 'Content-Type') {
        if (this._contentTypeIsSend) {
          return;
        }
        this._contentTypeIsSend = true;
      }
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
    let proxy = think.config('proxy') || this.host === this.hostname;
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
   * get or set cookie
   * @param  {} name    [description]
   * @param  {[type]} value   [description]
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
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
      data = errmsg;
      obj = think.extend({}, errno);
    }else{
      if (!think.isNumber(errno)) {
        data = errmsg;
        errmsg = errno;
        errno = error.value;
      }
      if(!think.isString(errmsg)){
        data = errmsg;
        errmsg = '';
      }
      //read errmsg from config/error.js config file
      errmsg = errmsg || error[errno] || '';
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
   * echo content
   * @param  {mixed} obj      []
   * @param  {String} encoding []
   * @return {Promise}          []
   */
  echo(obj, encoding = this.config('encoding')){
    if(!this.res.connection){
      return;
    }
    this.type(this.config('tpl.content_type'));
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
    this.echo(obj, encoding);
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