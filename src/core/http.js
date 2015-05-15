'use strict';

/**
 * wrap for request & response
 * @type {Object}
 */
var querystring = require('querystring');
var url = require('url');
var EventEmitter = require('events').EventEmitter;
var os = require('os');
var path = require('path');
var fs = require('fs');

var cookie = think.require('cookie');
var multiparty = require('multiparty');
var mime = require('mime');


module.exports = class {
  /**
   * init method
   * @param  {Object} req [request]
   * @param  {Object} res [response]
   * @return {}     []
   */
  constructor(req, res){
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
  }
  /**
   * exec
   * @return Promise            []
   */
  run(){
    this.bind();
    //array indexOf is faster than string
    var methods = ['POST', 'PUT', 'PATCH'];
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
    var contentLength = this.req.headers['content-length'] | 0;
    return contentLength > 0;
  }
  /**
   * get form file post
   * @return {Promise} []
   */
  getFormFilePost(){
    var deferred = Promise.defer();
    var uploadDir = think.config('post.file_upload_path');
    if (uploadDir) {
      think.mkdir(uploadDir);
    }
    var form = this.form = new multiparty.Form({
      maxFieldsSize: think.config('post.max_fields_size'),
      maxFields: think.config('post.max_fields'),
      maxFilesSize: think.config('post.max_file_size'),
      uploadDir: uploadDir
    });
    //support for file with multiple="multiple"
    var files = this.http._file;
    form.on('file', (name, value) => {
      if (name in files) {
        if (!think.isArray(files[name])) {
          files[name] = [files[name]];
        }
        files[name].push(value);
      }else{
        files[name] = value;
      }
    })
    form.on('field', (name, value) => {
      this.http._post[name] = value;
    });
    form.on('close', () => {
      deferred.resolve(this.http);
    });
    form.on('error', () => {
      this.res.statusCode = 413;
      this.res.end();
    });
    form.parse(this.req);
    return deferred.promise;
  }
  /**
   * common filed post
   * @return {Promise} []
   */
  getCommonPost(){
    var buffers = [];
    var deferred = Promise.defer();
    this.req.on('data', (chunk) => {
      buffers.push(chunk);
    });
    this.req.on('end', () => {
      this.http.payload = Buffer.concat(buffers).toString();
      this.parseFormData().then(() => {
        deferred.resolve(this.http);
      })
    })
    this.req.on('error', () => {
      this.res.statusCode = 413;
      this.res.end();
    })
    return deferred.promise;
  }
  /**
   * parse form data
   * @return {Promise} []
   */
  parseFormData(){
    return think.hook('form_parse', this.http).then(() => {
      if (think.isEmpty(this.http._post) && this.http.payload) {
        try{
          this.http._post = querystring.parse(this.http.payload);
        }catch(e){
          this.res.statusCode = 413;
          this.res.end();
          return Promise.defer().promise;
        }
      }
      var post = this.http._post;
      var length = Object.keys(post).length;
      if (length > think.config('post.max_fields')) {
        this.res.statusCode = 413;
        this.res.end();
        return Promise.defer().promise;
      }
      var maxFilesSize = think.config('post.max_fields_size');
      for(var name in post){
        if (post[name].length > maxFilesSize) {
          this.res.statusCode = 413;
          this.res.end();
          return Promise.defer().promise;
        }
      }
    })
  }
  /**
   * 通过ajax上传文件
   * @return {[type]} [description]
   */
  getAjaxFilePost(){
    var filename = this.req.headers[think.config('post.ajax_filename_header')];
    var deferred = Promise.defer();
    var filepath = think.config('post.file_upload_path') || (os.tmpdir() + '/thinkjs_upload');
    think.mkdir(filepath);
    var name = think.uuid(20);
    filepath += '/' + name + path.extname(filename).slice(0, 5);
    var stream = fs.createWriteStream(filepath);
    this.req.pipe(stream);
    stream.on('error', () => {
      this.res.statusCode = 413;
      this.res.end();
    })
    stream.on('close', () => {
      this.http._file.file = {
        fieldName: 'file',
        originalFilename: filename,
        path: filepath,
        size: fs.statSync(filepath).size
      }
      deferred.resolve(this.http);
    })
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
    var multiReg = /^multipart\/(form-data|related);\s*boundary=(?:"([^"]+)"|([^;]+))$/i;
    //file upload by form or FormData
    if (multiReg.test(this.req.headers['content-type'])) {
      return this.getFilePost();
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
    var http = this.http;
    http.url = this.req.url;
    http.version = this.req.httpVersion;
    http.method = this.req.method;
    http.headers = this.req.headers;

    var urlInfo = url.parse('//' + http.headers.host + this.req.url, true, true);
    http.pathname = path.normalize(urlInfo.pathname).slice(1);
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
    http.referer = this.referer;
    http.isAjax = this.isAjax;
    http.isJsonp = this.isJsonp;
    http.get = this.get;
    http.post = this.post;
    http.param = this.param;
    http.file = this.file;
    http.header = this.header;
    http.ip = this.ip;
    http.cookie = this.cookie;
    http.sendCookie = this.sendCookie;
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
   * get page request referer
   * @param  {String} host [only get referer host]
   * @return {String}      []
   */
  referer(host){
    var referer = this.headers.referer || this.headers.referrer || '';
    if (!referer || !host) {
      return referer;
    }
    var info = url.parse(referer);
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
   * get uesr ip
   * @return {String} [ip4 or ip6]
   */
  ip(){
    var connection = this.req.connection;
    var socket = this.req.socket;
    var ip;
    if (connection && connection.remoteAddress !== think.localIp) {
      ip = connection.remoteAddress;
    }else if (socket && socket.remoteAddress !== think.localIp) {
      ip = socket.remoteAddress;
    }else{
      ip = this.headers['x-forwarded-for'] || this.headers['x-real-ip'];
    }
    if (!ip) {
      return think.localIp;
    }
    // in node v0.12.0, ip is like ::ff:100.168.148.100
    if (ip.indexOf(':') > -1) {
      ip = ip.split(':').slice(-1).join('');
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
      var cookies = Object.values(this._sendCookie).map((item) => {
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
      options.expires = new Date (Date.now() + options.timeout * 1000);
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
    var time = Date.now() - this.startTime;
    this.header('X-' + (name || 'EXEC-TIME'), time + 'ms');
  }
  /**
   * output with success errno & errmsg
   * @param  {Object} data    [output data]
   * @param  {String} message [errmsg]
   * @return {Promise}         [pedding promise]
   */
  success(data, message){
    var key = [this.config('error.key'), this.config('error.msg')];
    var obj = think.getObject(key, [0, message || '']);
    if (data !== undefined) {
      obj.data = data;
    }
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
  fail(errno, errmsg, data){
    var obj;
    if (think.isObject(errno)) {
      data = errmsg;
      obj = think.extend({}, errno);
    }else{
      if (!think.isNumber(errno)) {
        data = errmsg;
        errmsg = errno;
        errno = this.config('error.value');
      }
      var key = [this.config('error.key'), this.config('error.msg')];
      var value = [errno, errmsg || 'error'];
      obj = think.getObject(key, value);
    }
    if (data !== undefined) {
      obj.data = data;
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
    var callback = this.get(this.config('callback_name'));
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
      this._view = think.require('view')(this);
    }
    return this._view;
  }
  /**
   * echo content
   * @param  {mixed} obj      []
   * @param  {String} encoding []
   * @return {Promise}          []
   */
  echo(obj, encoding){
    this.type(this.config('tpl.content_type'));
    this.cookie(true);
    this.sendTime();
    if (obj === undefined) {
      return;
    }
    if (think.isArray(obj) || think.isObject(obj)) {
      obj = JSON.stringify(obj);
    }else if (!think.isBuffer(obj)) {
      obj += '';
    }
    encoding = encoding || this.config('encoding');
    var outputConfig = this.config('output_content');
    if (!outputConfig) {
      return this.res.write(obj, encoding);
    }
    if (!this._outputContentPromise) {
      this._outputContentPromise = [];
    }
    var fn = think.co.wrap(outputConfig);
    var promise = fn(obj, encoding, this);
    this._outputContentPromise.push(promise);
  }
  _end(){
    this.cookie(true);
    this.sendTime();
    this.res.end();
    this.emit('afterEnd', this);

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
      this._end();
    }
    
    Promise.all(this._outputContentPromise).then(() => {
      this._outputContentPromise = undefined;
      this._end();
    }).catch(() => {
      this._end();
    })
  }
}