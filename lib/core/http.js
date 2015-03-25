'use strict'

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


module.exports = think.Class({
  /**
   * init method
   * @param  {Object} req [request]
   * @param  {Object} res [response]
   * @return {}     []
   */
  init: function(req, res){
    //request object
    this.req = req;
    //response object
    this.res = res;
    //instance of EventEmitter
    this.http = new EventEmitter();
    //set req & res to http
    this.http.req = req;
    this.http.res = res;
    //http start time
    this.http.startTime = Date.now();
  },
  /**
   * exec
   * @return Promise            []
   */
  run: function(){
    this.bind();
    //array indexOf is faster then string
    var methods = ['POST', 'PUT', 'PATCH'];
    if (methods.indexOf(this.req.method) > -1) {
      return this.getPostData();
    }
    return Promise.resolve(this.http);
  },
  /**
   * check request has post data
   * @return {Boolean} []
   */
  hasPostData: function(){
    if ('transfer-encoding' in this.req.headers) {
      return true;
    }
    var contentLength = this.req.headers['content-length'] | 0;
    return contentLength > 0;
  },
  /**
   * get form file post
   * @return {Promise} []
   */
  getFormFilePost: function(){
    var deferred = Promise.defer();
    var self = this;
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
    form.on('file', function(name, value){
      self.http._file[name] = value;
    });
    form.on('field', function(name, value){
      self.http._post[name] = value;
    });
    form.on('close', function(){
      deferred.resolve(self.http);
    });
    form.on('error', function(err){
      self.res.statusCode = 413;
      self.res.end();
    });
    form.parse(this.req);
    return deferred.promise;
  },
  /**
   * common filed post
   * @return {Promise} []
   */
  getCommonPost: function(){
    var buffers = [];
    var self = this;
    var deferred = Promise.defer();
    this.req.on('data', function(chunk){
      buffers.push(chunk);
    });
    this.req.on('end', function(){
      self.http.payload = Buffer.concat(buffers).toString();
      self.parseFormData().then(function(){
        deferred.resolve(self.http);
      })
    })
    this.req.on('error', function(){
      self.res.statusCode = 413;
      self.res.end();
    })
    return deferred.promise;
  },
  /**
   * parse form data
   * @return {Promise} []
   */
  parseFormData: function(){
    var self = this;
    return think.hook('form_parse', this.http).then(function(){
      if (think.isEmpty(self.http._post) && self.http.payload) {
        try{
          self.http._post = querystring.parse(self.http.payload);
        }catch(e){
          self.res.statusCode = 413;
          self.res.end();
          return Promise.defer().promise;
        }
      }
      var post = self.http._post;
      var length = Object.keys(post).length;
      if (length > think.config('post.max_fields')) {
        self.res.statusCode = 413;
        self.res.end();
        return Promise.defer().promise;
      }
      var maxFilesSize = think.config('post.max_fields_size');
      for(var name in post){
        if (post[name].length > maxFilesSize) {
          self.res.statusCode = 413;
          self.res.end();
          return Promise.defer().promise;
        }
      }
    })
  },
  /**
   * 通过ajax上传文件
   * @return {[type]} [description]
   */
  getAjaxFilePost: function(){
    var self = this;
    var filename = this.req.headers[think.config('post.ajax_filename_header')];
    var deferred = Promise.defer();
    var filepath = think.config('post.file_upload_path') || (os.tmpdir() + '/thinkjs_upload');
    think.mkdir(filepath);
    var name = think.uuid(20);
    filepath += '/' + name + path.extname(filename).slice(0, 5);
    var stream = fs.createWriteStream(filepath);
    this.req.pipe(stream);
    stream.on('error', function(err){
      self.res.statusCode = 413;
      self.res.end();
    })
    stream.on('close', function(){
      self.http._file.file = {
        fieldName: 'file',
        originalFilename: filename,
        path: filepath,
        size: fs.statSync(filepath).size
      }
      deferred.resolve(self.http);
    })
    return deferred.promise;
  },
  /**
   * get post data from request
   * @return {Promise} []
   */
  getPostData: function(){
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
  },
  /**
   * bind props & methods to http
   * @return {} []
   */
  bind: function(){
    this.http.url = this.req.url;
    this.http.version = this.req.httpVersion;
    this.http.method = this.req.method;
    this.http.headers = this.req.headers;
    this.http.contentType = (this.req.headers['content-type'] || '').split(';')[0].trim();

    this.http._file = {};
    this.http._post = {};
    this.http._cookie = cookie.parse(this.req.headers.cookie);
    this.http._sendCookie = {};

    var urlInfo = url.parse('//' + this.req.headers.host + this.req.url, true, true);
    this.http.pathname = path.normalize(urlInfo.pathname).slice(1);
    this.http.query = urlInfo.query;
    this.http._get = think.extend({}, urlInfo.query);
    this.http.host = urlInfo.host;
    this.http.hostname = urlInfo.hostname;

    this.http.referer = this.referer;
    this.http.isAjax = this.isAjax;
    this.http.isJsonp = this.isJsonp;
    this.http.get = this.get;
    this.http.post = this.post;
    this.http.param = this.param;
    this.http.file = this.file;
    this.http.header = this.header;
    this.http.ip = this.ip;
    this.http.cookie = this.cookie;
    this.http.sendCookie = this.sendCookie;
    this.http.redirect = this.redirect;
    this.http.echo = this.echo;
    this.http.end = this.end;
    this.http.sendTime = this.sendTime;
    this.http.type = this.type;
  },
  /**
   * get or set content type
   * @param  {String} ext [file ext]
   * @return {}     []
   */
  type: function(contentType, encoding){
    if (!contentType) {
      return this.contentType;
    }
    if (this._contentTypeIsSend) {
      return;
    }
    if (contentType.indexOf('/') === -1) {
      contentType = mime.lookup(contentType);
    }
    if (contentType.toLowerCase().indexOf('charset=') === -1) {
      contentType += '; charset=' + (encoding || this.config.encoding);
    }
    this.header('Content-Type', contentType);
  },
  /**
   * get page request referer
   * @param  {String} host [only get referer host]
   * @return {String}      []
   */
  referer: function(host){
    var referer = this.headers.referer || this.headers.referrer || '';
    if (!referer || !host) {
      return referer;
    }
    var info = url.parse(referer);
    return info.hostname;
  },
  /**
   * is ajax request
   * @param  {String}  method []
   * @return {Boolean}        []
   */
  isAjax: function(method) {
    if (method && this.method !== method.toUpperCase()) {
      return false;
    }
    return this.headers['x-requested-with'] === 'XMLHttpRequest';
  },
  /**
   * is jsonp request
   * @param  {String}  name [callback name]
   * @return {Boolean}      []
   */
  isJsonp: function(name){
    name = name || think.config('callback_name');
    return !!this.get(name);
  },
  /**
   * get get params
   * @param  {String} name []
   * @return {Object | String}      []
   */
  get: function(name){
    if (name === undefined) {
      return this._get;
    }
    return this._get[name] || '';
  },
  /**
   * get post params
   * @param  {String} name []
   * @return {Object | String}      []
   */
  post: function(name){
    if (name === undefined) {
      return this._post;
    }
    return this._post[name] || '';
  },
  /**
   * get post or get params
   * @param  {String} name []
   * @return {Object | String}      []
   */
  param: function(name){
    if (name === undefined) {
      return think.extend({}, this._get, this._post);
    }
    return this._post[name] || this._get[name] || '';
  },
  /**
   * get file data
   * @param  {String} name []
   * @return {Object}      []
   */
  file: function(name){
    if (name === undefined) {
      return this._file;
    }
    return this._file[name] || {};
  },
  /**
   * get or set header
   * @param  {String} name  [header name]
   * @param  {String} value [header value]
   * @return {}       []
   */
  header: function(name, value){
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
  },
  /**
   * get uesr ip
   * @return {String} [ip4 or ip6]
   */
  ip: function(){
    var connection = this.req.connection;
    var socket = this.req.socket;
    if (connection && connection.remoteAddress !== localIp) {
      return connection.remoteAddress;
    }else if (socket && socket.remoteAddress !== localIp) {
      return socket.remoteAddress;
    }
    return this.headers['x-forwarded-for'] || this.headers['x-real-ip'] || think.localIp;
  },
  /**
   * get or set cookie
   * @param  {} name    [description]
   * @param  {[type]} value   [description]
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */
  cookie: function(name, value, options){
    //send cookies
    if (name === true) {
      if (think.isEmpty(this._sendCookie)) {
        return;
      }
      var cookies = Object.values(this._sendCookie).map(function(item){
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
    options = think.extend({}, think.config('cookie'), options);
    if (value === null) {
      options.timeout = -1000;
    }
    if (options.timeout !== 0) {
      options.expires = new Date (Date.now() + options.timeout * 1000);
    }
    options.name = name;
    options.value = value;
    this._sendCookie[name] = options;
  },
  /**
   * redirect
   * @param  {String} url  [redirect url]
   * @param  {Number} code []
   * @return {}      []
   */
  redirect: function(url, code){
    this.res.statusCode = code || 302;
    this.header('Location', url || '/');
    this.end();
  },
  /**
   * send time
   * @param  {String} name [time type]
   * @return {}      []
   */
  sendTime: function(name){
    var time = Date.now() - this.startTime;
    this.header('X-' + (name || 'EXEC-TIME'), time + 'ms');
  },
  /**
   * echo content
   * @param  {mixed} obj      []
   * @param  {String} encoding []
   * @return {Promise}          []
   */
  echo: function(obj, encoding){
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
    var self = this;
    encoding = encoding || think.config('encoding');
    return think.hook('content_write', this, obj).then(function(obj){
      if (think.isBuffer(obj)) {
        self.res.write(obj);
      }else{
        self.res.write(obj, encoding);
      }
      return obj;
    })
  },
  /**
   * http end
   * @return {} []
   */
  end: function(){
    this.emit('beforeEnd', this);
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
          fs.unlink(filepath, function(){});
        }
      }
    }
  }
}, true);