/**
 * 对HttpRequest和HttpResponse 2个对象重新包装
 * @type {Object}
 */
var querystring = require('querystring');
var url = require('url');
var cookie = thinkRequire('Cookie');
var EventEmitter = require('events').EventEmitter;
var multiparty = require('multiparty');
var crypto = require('crypto');
var os = require('os');
var path = require('path');
var fs = require('fs');

var localIp = '127.0.0.1';
var Http = module.exports = Class(function(){
  'use strict';
  return {
    init: function(req, res){
      this.req = req;
      this.res = res;
      //http对象为EventEmitter的实例
      this.http = new EventEmitter();
      //记录当前请求的开始时间
      this.http.startTime = Date.now();
    },
    /**
     * 执行
     * @param  {Function} callback [description]
     * @return Promise            [description]
     */
    run: function(){
      this._request();
      this._response();
      //数组的indexOf要比字符串的indexOf略快
      var methods = ['POST', 'PUT', 'PATCH'];
      if (methods.indexOf(this.req.method) > -1) {
        return this.getPostData();
      }
      return getPromise(this.http);
    },
    /**
     * 检测是否含有post数据
     * @return {Boolean} [description]
     */
    hasPostData: function(){
      if ('transfer-encoding' in this.req.headers) {
        return true;
      }
      var contentLength = this.req.headers['content-length'] | 0;
      return contentLength > 0;
    },
    /**
     * 过滤query值
     * @return {[type]} [description]
     */
    filterQuery: function(data){
      if (!C('filter_data')) {
        return data;
      }
      if (isArray(data)) {
        return data[0];
      }else if (isObject(data)) {
        var ret = {};
        for(var key in data){
          if (isArray(data[key])) {
            ret[key] = data[key][0];
          }else{
            ret[key] = data[key];
          }
        }
        return ret;
      }
      return data;
    },
    /**
     * 含有文件的表单上传
     * @return {[type]} [description]
     */
    _filePost: function(){
      var deferred = getDefer();
      var self = this;
      var uploadDir = C('post_file_upload_path');
      if (uploadDir) {
        mkdir(uploadDir);
      }
      var form = this.form = new multiparty.Form({
        maxFieldsSize: C('post_max_fields_size'),
        maxFields: C('post_max_fields'),
        maxFilesSize: C('post_max_file_size'),
        uploadDir: uploadDir
      });
      form.on('file', function(name, value){
        self.http.file[name] = value;
      });
      form.on('field', function(name, value){
        self.http.post[name] = self.filterQuery(value);
      });
      form.on('close', function(){
        deferred.resolve(self.http);
      });
      //有错误后直接拒绝当前请求
      form.on('error', function(err){
        console.error(err.stack);
        self.res.statusCode = 413;
        self.res.end();
      });
      form.parse(this.req);
      return deferred.promise;
    },
    /**
     * 普通的表单上传
     * @return {[type]} [description]
     */
    _commonPost: function(){
      var buffers = [];
      var length = 0;
      var self = this;
      var deferred = getDefer();
      this.req.on('data', function(chunk){
        buffers.push(chunk);
        length += chunk.length;
      });
      this.req.on('end', function(){
        self.http.payload = Buffer.concat(buffers).toString();
        tag('form_parse', self.http).then(function(){
          //默认使用querystring.parse解析
          if (isEmpty(self.http.post) && self.http.payload) {
            self.http.post = self.filterQuery(querystring.parse(self.http.payload));
          }
          var post = self.http.post;
          var length = Object.keys(post).length;
          //最大表单数超过限制
          if (length > C('post_max_fields')) {
            self.res.statusCode = 413;
            self.res.end();
            return;
          }
          for(var name in post){
            //单个表单值长度超过限制
            if (post[name].length > C('post_max_fields_size')) {
              self.res.statusCode = 413;
              self.res.end();
              return;
            }
          }
          deferred.resolve(self.http);
        })
      });
      return deferred.promise;
    },
    /**
     * 通过ajax上传文件
     * @return {[type]} [description]
     */
    _ajaxFilePost: function(){
      var self = this;
      var filename = this.req.headers[C('post_ajax_filename_header')];
      var deferred = getDefer();
      var filepath = C('post_file_upload_path') || (os.tmpdir() + '/thinkjs_upload');
      var name = crypto.randomBytes(20).toString('base64').replace(/\+/g, '_').replace(/\//g, '_');
      mkdir(filepath);
      filepath += '/' + name + path.extname(filename);
      var stream = fs.createWriteStream(filepath);
      this.req.pipe(stream);
      stream.on('error', function(err){
        deferred.reject(err);
      })
      stream.on('close', function(){
        self.http.file.file = {
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
     * 获取POST过来的数据，包含上传的文件
     * 依赖multiparty库
     * @return {[type]}            [description]
     */
    getPostData: function(){
      //没有post数据，直接返回
      if (!this.hasPostData()) {
        return getPromise(this.http);
      }
      //上传的数据中是否含有文件的检测正则
      var multiReg = /^multipart\/(form-data|related);\s*boundary=(?:"([^"]+)"|([^;]+))$/i;
      if (multiReg.test(this.req.headers['content-type'])) {
        return this._filePost();
      }else if(this.req.headers[C('post_ajax_filename_header')]){ //通过ajax上传文件
        return this._ajaxFilePost();
      }else{
        return this._commonPost();
      }
    },
    /**
     * HttpRequest增强
     * @return {[type]} [description]
     */
    _request: function(){
      var req = {
        //http版本号
        version: this.req.httpVersion,
        //请求方法
        method: this.req.method,
        //请求头
        headers: this.req.headers,
        getHeader: function(name){
          return this.headers[name] || '';
        },
        //请求的Content-Type
        contentType: (this.req.headers['content-type'] || '').split(';')[0].trim(),
        //post信息
        post: {},
        //上传的文件信息
        file: {},
        //请求用户的ip
        ip: function(){
          var connection = this.req.connection;
          var socket = this.req.socket;
          if (connection && connection.remoteAddress !== localIp) {
            return connection.remoteAddress;
          }else if (socket && socket.remoteAddress !== localIp) {
            return socket.remoteAddress;
          }
          return this.headers['x-forwarded-for'] || this.headers['x-real-ip'] || localIp;
        },
        //请求的cookie
        cookie: cookie.parse(this.req.headers.cookie || '')
      };
      extend(this.http, req);

      //解析url中的参数
      var urlInfo = url.parse('//' + req.headers.host + this.req.url, true, true);
      this.http.pathname = urlInfo.pathname;
      //query只记录?后面的参数
      this.http.query = this.filterQuery(urlInfo.query);
      //get包含路由解析追加的参数
      this.http.get = extend({}, urlInfo.query);
      //主机名，带端口
      this.http.host = urlInfo.host;
      //主机名，不带端口
      this.http.hostname = urlInfo.hostname;
      //将原生的request对象放在http上，方便后续在controller等地方使用
      this.http.req = this.req;
    },
    /**
     * HttpResponse增强
     * @return {[type]} [description]
     */
    _response: function(){
      var res = {
        /**
         * 一次请求下，可能会发送多个Cookie，所以这里不能立即发送
         * 需要临时存起来，到输出内容前统一发送
         * @type {Object}
         */
        _cookie: {},
        /**
         * 发送header
         * @param {[type]} name  [description]
         * @param {[type]} value [description]
         */
        setHeader: function(name, value){
          if (!this.res.headersSent) {
            this.res.setHeader(name, value);
          }
        },
        /**
         * 设置cookie
         * @param {[type]} name    [description]
         * @param {[type]} value   [description]
         * @param {[type]} options [description]
         */
        setCookie: function(name, value, options){
          options = options || {};
          if (typeof options === 'number') {
            options = {timeout: options};
          }
          var timeout = options.timeout;
          if (timeout === undefined) {
            timeout = C('cookie_timeout');
          }
          //delete options.timeout;
          //if value is null, remove cookie
          if (value === null) {
            timeout = -1000;
          }
          var defaultOptions = {
            path: C('cookie_path'),
            domain: C('cookie_domain'),
            expires: new Date (Date.now() + timeout * 1000)
          };
          if (timeout === 0) {
            delete defaultOptions.expires;
          }
          for(var key in options){
            defaultOptions[key.toLowerCase()] = options[key];
          }
          defaultOptions.name = name;
          defaultOptions.value = value + '';
          this._cookie[name] = defaultOptions;
        },
        /**
         * 将队列中的cookie发送出去
         * @return {[type]} [description]
         */
        sendCookie: function(){
          var cookies = Object.values(this._cookie).map(function(item){
            return cookie.stringify(item.name, item.value, item);
          });
          if (cookies.length) {
            this.setHeader('Set-Cookie', cookies);
            this._cookie = {};
          }
        },
        /**
         * url跳转
         * @param  {[type]} url  [description]
         * @param  {[type]} code [description]
         * @return {[type]}      [description]
         */
        redirect: function(url, code){
          this.res.statusCode = code || 302;
          this.setHeader('Location', url || '/');
          this.end();
        },
        /**
         * 发送执行时间
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */
        sendTime: function(name){
          var time = Date.now() - this.startTime;
          this.setHeader('X-' + (name || 'EXEC-TIME'), time + 'ms');
        },
        /**
         * 输出内容
         * @param  {[type]} obj      [description]
         * @param  {[type]} encoding [description]
         * @return {[type]}          [description]
         */
        echo: function(obj, encoding){
          this.sendCookie();
          if (obj === undefined) {
            return;
          }
          if (isArray(obj) || isObject(obj)) {
            obj = JSON.stringify(obj);
          }
          if (!isString(obj) && !isBuffer(obj)) {
            obj += '';
          }
          var self = this;
          return tag('content_write', this, obj).then(function(obj){
            if (isBuffer(obj)) {
              self.res.write(obj);
            }else{
              self.res.write(obj, encoding || C('encoding'));
            }
            return obj;
          })
        },
        /**
         * 结束URL
         * @return {[type]} [description]
         */
        end: function(){
          this.emit('beforeEnd', this);
          this.sendCookie();
          this.res.end();
          this.emit('afterEnd', this);
          if (C('post_file_autoremove') && !isEmpty(this.file)) {
            var key, path, fn = function(){};
            for(key in this.file){
              path = this.file[key].path;
              if (isFile(path)) {
                fs.unlink(path, fn);
              }
            }
          }
        }
      };
      extend(this.http, res);
      //将原生的response对象放在http上，方便后续controller等地方使用
      this.http.res = this.res;
    }
  };
});
/**
 * 获取默认的http信息
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
Http.getDefaultHttp = function(data){
  'use strict';
  data = data || {};
  if (isString(data)) {
    if (data[0] === '{') {
      data = JSON.parse(data);
    }else if (/^[\w]+\=/.test(data)) {
      data = querystring.parse(data);
    }else{
      data = {url: data};
    }
  }
  var url = data.url || '';
  if (url.indexOf('/') !== 0) {
    url = '/' + url;
  }
  return {
    req: {
      httpVersion: '1.1',
      method: (data.method || 'GET').toUpperCase(),
      url: url,
      headers: extend({
        host: data.host || localIp
      }, data.headers),
      connection: {
        remoteAddress: data.ip || localIp
      }
    },
    res: {
      end: data.end || data.close || Http.empty,
      write: data.write || data.send || Http.empty,
      setHeader: Http.empty
    }
  };
};
/**
 * 空函数
 * @return {[type]} [description]
 */
Http.empty = function(data){
  'use strict';
  return data;
}
